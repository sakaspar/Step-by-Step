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
  
  const contractName = 'Arb';
  await hre.run("compile");
  const smartContract = await hre.ethers.getContractFactory(contractName);
  const contract = await smartContract.deploy();
  await contract.deployed();
  console.log(`${contractName} deployed to: ${contract.address}`); 
  console.log('Put the above contract address into the .env file under arbContract');
  
  // Deploy InstaArb
  const instaContractName = 'InstaArb';
  const instaSmartContract = await hre.ethers.getContractFactory(instaContractName);
  const instaContract = await instaSmartContract.deploy();
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
