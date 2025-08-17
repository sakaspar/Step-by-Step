const hre = require("hardhat");

async function main() {
  [owner] = await ethers.getSigners();
  console.log(`Owner: ${owner.address}`);
  
  const contractAddress = "0xA940Ad5752BD80f31d7e0d2A5bB6216c8Fec9CA3";
  console.log(`Contract Address: ${contractAddress}`);
  
  // Check owner's balances
  const balance = await owner.getBalance();
  console.log(`Owner ETH Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Check if you have any testnet tokens
  const wnearAddress = "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d";
  const usdtAddress = "0x4988a896b1227218e4A686fdE5EabdcAbd91571f";
  const usdcAddress = "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802";
  
  try {
    const wnearContract = await ethers.getContractAt("WETH9", wnearAddress);
    const wnearBalance = await wnearContract.balanceOf(owner.address);
    console.log(`Owner WNEAR Balance: ${ethers.utils.formatEther(wnearBalance)} WNEAR`);
    
    if (wnearBalance.gt(0)) {
      console.log("✅ You have WNEAR! You can transfer some to your contract.");
      console.log("To fund your contract, you need to:");
      console.log("1. Go to Aurora testnet explorer");
      console.log("2. Send some WNEAR to:", contractAddress);
      console.log("3. Or use a DEX to swap ETH for WNEAR and send to contract");
    } else {
      console.log("❌ No WNEAR balance. You need to get testnet tokens first.");
    }
  } catch (e) {
    console.log("❌ Error checking WNEAR balance. Token might not exist on testnet.");
  }
  
  console.log("\n🔗 Useful Links:");
  console.log("Aurora Testnet Explorer: https://testnet.aurora.dev");
  console.log("Aurora Faucet: https://aurora.dev/faucet");
  console.log("Testnet Bridge: https://testnet.aurora.dev/bridge");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
