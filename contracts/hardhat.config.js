require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const MAINNET_FORK_RPC_URL = process.env.MAINNET_FORK_RPC_URL;
const GOERLI_FORK_RPC_URL = process.env.GOERLI_FORK_RPC_URL;

module.exports = {
  defaultNetwork:"localhost",
  networks: {
    hardhat: {
      forking: {
        url: MAINNET_FORK_RPC_URL,
      },
    },
    goerli: {
      url: GOERLI_FORK_RPC_URL,
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
