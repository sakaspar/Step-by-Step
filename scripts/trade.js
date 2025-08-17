const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

let config, arb, owner;
const network = hre.network.name;

// Load config based on network
if (network === 'aurora') {
  config = require('../config/aurora.json');
} else if (network === 'fantom') {
  config = require('../config/fantom.json');
} else if (network === 'aurora_testnet') {
  try {
    config = require('../config/aurora-testnet.json');
  } catch (e) {
    config = require('../config/aurora.json');
  }
}

console.log(`Network: ${network}`);
console.log(`Loaded ${config.routes.length} routes`);

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Helper function to safely check if a contract exists and has code
const contractExists = async (address) => {
  try {
    const code = await ethers.provider.getCode(address);
    return code !== "0x";
  } catch (error) {
    return false;
  }
};

// Helper function to safely get token balance
const getTokenBalance = async (tokenAddress, contractAddress) => {
  try {
    // First check if contract exists
    if (!(await contractExists(tokenAddress))) {
      throw new Error("Contract does not exist");
    }
    
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, ethers.provider);
    const balance = await tokenContract.balanceOf(contractAddress);
    return balance;
  } catch (error) {
    throw new Error(`Failed to get balance: ${error.message}`);
  }
};

const main = async () => {
  [owner] = await ethers.getSigners();
  console.log(`Owner: ${owner.address}`);
  
  const IArb = await ethers.getContractFactory('InstaArb');
  arb = await IArb.attach(config.arbContract);
  
  console.log(`Arb contract: ${config.arbContract}`);
  
  // Check initial balances
  await checkBalances();
  
  // Start looking for arbitrage opportunities
  await lookForArbitrage();
}

const checkBalances = async () => {
  console.log('\n=== CHECKING BALANCES ===');
  
  for (let i = 0; i < config.baseAssets.length; i++) {
    const asset = config.baseAssets[i];
    
    try {
      // Handle ERC-20 tokens with proper interface
      try {
        const balance = await getTokenBalance(asset.address, config.arbContract);
        console.log(`${asset.sym}: ${ethers.utils.formatEther(balance)} (${balance.toString()} wei)`);
      } catch (error) {
        console.log(`${asset.sym}: ⚠️ Error checking balance - ${error.message}`);
      }
    } catch (error) {
      console.log(`${asset.sym}: ❌ Failed to check balance - ${error.message}`);
    }
  }
  console.log('=== END BALANCES ===\n');
}

const lookForArbitrage = async () => {
  console.log('🔍 Looking for arbitrage opportunities...');
  
  let profitableRoutes = [];
  let skippedRoutes = 0;
  let invalidBaseAssetRoutes = 0;
  let estimationFailedRoutes = 0;
  
  // Create a set of valid base asset addresses for fast lookup
  const baseAssetAddresses = new Set(config.baseAssets.map(asset => asset.address.toLowerCase()));
  
  console.log(`Valid base assets: ${config.baseAssets.map(asset => asset.sym).join(', ')}`);
  
  // Check each route for profitability
  for (let i = 0; i < config.routes.length; i++) {
    const route = config.routes[i];
    const [router1, router2, token1, token2] = route;
    
    // First check if token1 is a valid base asset
    if (!baseAssetAddresses.has(token1.toLowerCase())) {
      console.log(`   ⚠️ Skipping route ${i + 1} - Token1 ${token1} is not a base asset`);
      invalidBaseAssetRoutes++;
      continue;
    }
    
    try {
      // Get current balance for token1 (which we now know is a valid base asset)
      let token1Balance;
      
      // ERC-20 token balance - use safe method
      try {
        token1Balance = await getTokenBalance(token1, config.arbContract);
      } catch (error) {
        console.log(`   ⚠️ Skipping route ${i + 1} - Cannot check balance for token ${token1}: ${error.message}`);
        skippedRoutes++;
        continue;
      }
      
      // Skip if no balance
      if (token1Balance.isZero()) {
        console.log(`   ⚠️ Skipping route ${i + 1} - No balance for token1`);
        skippedRoutes++;
        continue;
      }
      
      // Use a reasonable trade size (don't use entire balance)
      const tradeSize = token1Balance.mul(8).div(10); // Use 80% of balance
      
      // Check minimum trade size (0.0001 ETH or equivalent - reduced to work with smaller balances)
      const minTradeSize = ethers.utils.parseEther("0.0001");
      if (tradeSize.lt(minTradeSize)) {
        console.log(`   ⚠️ Skipping route ${i + 1} - Trade size too small (${ethers.utils.formatEther(tradeSize)} < 0.0001)`);
        skippedRoutes++;
        continue;
      }
      
      console.log(`\n📊 Checking route ${i + 1}/${config.routes.length}:`);
      console.log(`   Router1: ${router1}`);
      console.log(`   Router2: ${router2}`);
      console.log(`   Token1: ${token1} (base asset)`);
      console.log(`   Token2: ${token2}`);
      console.log(`   Trade size: ${ethers.utils.formatEther(tradeSize)} ETH`);
      
      // Try to estimate the trade with better error handling
      let amtBack;
      try {
        amtBack = await arb.estimateDualDexTrade(router1, router2, token1, token2, tradeSize);
      } catch (error) {
        console.log(`   ⚠️ Skipping route ${i + 1} - Trade estimation failed: ${error.message}`);
        estimationFailedRoutes++;
        continue;
      }
      
      // Calculate profit threshold (minimum 0.5% profit)
      const minProfitBps = 50; // 0.5% = 50 basis points
      const multiplier = ethers.BigNumber.from(10000 + minProfitBps);
      const profitTarget = tradeSize.mul(multiplier).div(10000);
      
      console.log(`   Expected return: ${ethers.utils.formatEther(amtBack)} ETH`);
      console.log(`   Profit target: ${ethers.utils.formatEther(profitTarget)} ETH`);
      
      // Check if profitable
      if (amtBack.gt(profitTarget)) {
        const profit = amtBack.sub(tradeSize);
        const profitBps = profit.mul(10000).div(tradeSize);
        
        console.log(`   ✅ PROFITABLE! Profit: ${ethers.utils.formatEther(profit)} ETH (${profitBps.toString()} bps)`);
        
        profitableRoutes.push({
          route: [router1, router2, token1, token2],
          tradeSize,
          expectedReturn: amtBack,
          profit,
          profitBps
        });
      } else {
        const loss = tradeSize.sub(amtBack);
        const lossBps = loss.mul(10000).div(tradeSize);
        console.log(`   ❌ Not profitable. Loss: ${ethers.utils.formatEther(loss)} ETH (${lossBps.toString()} bps)`);
      }
      
    } catch (error) {
      console.log(`   ⚠️ Error checking route ${i + 1}: ${error.message}`);
      skippedRoutes++;
      continue;
    }
  }
  
  console.log(`\n📊 Analysis complete:`);
  console.log(`   Total routes: ${config.routes.length}`);
  console.log(`   Invalid base asset routes: ${invalidBaseAssetRoutes}`);
  console.log(`   Estimation failed routes: ${estimationFailedRoutes}`);
  console.log(`   Skipped routes: ${skippedRoutes}`);
  console.log(`   Profitable routes: ${profitableRoutes.length}`);
  
  if (profitableRoutes.length > 0) {
    // Sort by profit (highest first)
    profitableRoutes.sort((a, b) => b.profitBps.sub(a.profitBps).toNumber());
    
    console.log('\n💰 TOP PROFITABLE ROUTES:');
    profitableRoutes.slice(0, 3).forEach((route, index) => {
      console.log(`${index + 1}. Profit: ${route.profitBps.toString()} bps (${ethers.utils.formatEther(route.profit)} ETH)`);
    });
    
    // Execute the most profitable trade
    const bestRoute = profitableRoutes[0];
    console.log(`\n🚀 Executing best trade with ${bestRoute.profitBps.toString()} bps profit...`);
    
    try {
      const [router1, router2, token1, token2] = bestRoute.route;
      const wethAddress = config.baseAssets.find(asset => asset.sym === 'eth').address;

      let tx;
      if (token1.toLowerCase() === wethAddress.toLowerCase()) {
        console.log("Executing ETH trade");
        tx = await arb.connect(owner).dualDexTradeEth(
          router1,
          router2,
          token2,
          { value: bestRoute.tradeSize }
        );
      } else {
        console.log("Executing ERC20 trade");
        tx = await arb.connect(owner).dualDexTrade(
          router1,
          router2,
          token1,
          token2,
          bestRoute.tradeSize
        );
      }
      
      console.log(`📝 Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Trade executed! Gas used: ${receipt.gasUsed.toString()}`);
      
      // Check balances after trade
      await checkBalances();
      
    } catch (error) {
      console.error(`❌ Trade execution failed: ${error.message}`);
    }
  } else {
    console.log('❌ No profitable routes found. Waiting 30 seconds before next scan...');
    setTimeout(() => lookForArbitrage(), 30000);
  }
}

process.on('uncaughtException', function(err) {
  console.log('UnCaught Exception: ' + err);
  console.error(err.stack);
  fs.appendFile('./critical.txt', err.stack, function(){ });
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: '+p+' - reason: '+reason);
});

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
