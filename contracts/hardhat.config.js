require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    chz: {
      url: "https://rpc.ankr.com/chiliz",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
