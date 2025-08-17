const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const config = require('../config/aurora-testnet.json');
  const wethAddress = config.baseAssets.find(asset => asset.sym === 'eth').address;
  const arbContractAddress = config.arbContract;

  const [owner] = await ethers.getSigners();
  console.log(`Owner: ${owner.address}`);

  const weth = await ethers.getContractAt("IWETH", wethAddress);

  // Wrap 0.001 ETH and send to the contract
  const amount = ethers.utils.parseEther("0.001");
  console.log(`Wrapping ${ethers.utils.formatEther(amount)} ETH to WETH...`);
  const tx = await weth.deposit({ value: amount });
  await tx.wait();
  console.log("Wrap successful.");

  console.log(`Transferring WETH to arb contract ${arbContractAddress}...`);
  const transferTx = await weth.transfer(arbContractAddress, amount);
  await transferTx.wait();
  console.log("Transfer successful.");

  const balance = await weth.balanceOf(arbContractAddress);
  console.log(`Arb contract WETH balance: ${ethers.utils.formatEther(balance)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
