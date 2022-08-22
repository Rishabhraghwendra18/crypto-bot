require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    goerli:{
      url:`https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`,
      accounts:[process.env.METAMASK_PRIVATE_KEY]
    }
  },
  solidity: "0.8.10",
  
};
