require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    chz: {
      url: "https://spicy-rpc.chiliz.com/",
      accounts: [process.env.PRIVATE_KEY]
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    sepolia: {
      url: 'https://rpc.ankr.com/eth_sepolia',
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    'linea-sepolia': {
      url: "https://rpc.sepolia.linea.build",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
