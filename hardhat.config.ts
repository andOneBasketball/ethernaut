import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import dotenv from "dotenv";

dotenv.config();

const ETH_URL = process.env.ETH_URL;
const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const LOCAL_PRIVATE_KEY = process.env.LOCAL_PRIVATE_KEY;
const EVM_SCAN_API_KEY = process.env.EVM_SCAN_API_KEY;

const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.27", // 默认编译版本
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.0"
      },
      { 
        version: "0.6.0"
      },
      { 
        version: "0.7.3"
      }
    ],
  },
  networks: {
    eth: {
      url: ETH_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1,
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: EVM_SCAN_API_KEY,
    customChains: []
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: false
  },

  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
        default: 1,
    },
  },
  gasReporter: {
    enabled: false
  },
  mocha: {
    timeout: 500000, // 500 seconds max for running tests
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts"
  },
};

export default config;