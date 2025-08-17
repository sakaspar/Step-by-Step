require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    aurora: {
      url: `https://mainnet.aurora.dev`,
      accounts: [process.env.privateKey],
    },
    aurora_testnet: {
      url: `https://testnet.aurora.dev`,
      accounts: [process.env.privateKey],
      chainId: 1313161555,
      timeout: 60000, // Increase timeout to 60 seconds
    },
    aurora_testnet_alt: {
      url: `https://aurora-testnet.public.blastapi.io`,
      accounts: [process.env.privateKey],
      chainId: 1313161555,
      timeout: 60000,
    },
    aurora_testnet_quicknode: {
      url: `https://restless-spring-forest.aurora-testnet.quiknode.pro/`,
      accounts: [process.env.privateKey],
      chainId: 1313161555,
      timeout: 60000,
    },
    fantom: {
      url: `https://rpc.ftm.tools/`,
      accounts: [process.env.privateKey],
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.7" },
      { version: "0.7.6" },
      { version: "0.6.6" }
    ]
  },
};
