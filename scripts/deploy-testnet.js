const hre = require("hardhat");

async function main() {
  [owner] = await ethers.getSigners();
  console.log(`Owner: ${owner.address}`);
  
  // Check balance (in ETH)
  const balance = await owner.getBalance();
  console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther("0.0006"))) {
    console.log("❌ Insufficient balance. Get testnet ETH from:");
    console.log("https://aurora.dev/faucet");
    console.log("https://testnet.aurora.dev/bridge");
    return;
  }
  
  console.log("✅ Sufficient balance, deploying contracts...");
  
  // Deploy InstaArb
  const config = require('../config/aurora-testnet.json');
  const wethAddress = config.baseAssets.find(asset => asset.sym === 'eth').address;
  const instaContractName = 'InstaArb';
  const instaSmartContract = await hre.ethers.getContractFactory(instaContractName);
  const instaContract = await instaSmartContract.deploy(wethAddress);
  await instaContract.deployed();
  console.log(`${instaContractName} deployed to: ${instaContract.address}`);
  console.log('Put the above contract address into the .env file under instaArbContract');
  
  console.log("\n🎉 Deployment Complete!");
  console.log("Next: Update config/aurora-testnet.json with these addresses, then run trade.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 
