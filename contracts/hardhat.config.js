require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const MAINNET_FORK_RPC_URL = process.env.MAINNET_FORK_RPC_URL;

module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_FORK_RPC_URL,
      },
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.10",
      },
      {
        version: "0.6.12",
      },
    ],
  },
};
