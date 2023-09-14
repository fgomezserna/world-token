import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { HardhatUserConfig, task } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const NETWORK_GAS_PRICE: Partial<Record<string, number>> = {
  // "mainnet": ethers.utils.parseUnits("10", "gwei").toNumber(),
  // "sepolia": ethers.utils.parseUnits("10", "gwei").toNumber(),
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
            details: {
              yul: true,
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      chainId: 31337,
      forking: {
        url: process.env.ETH_MAINNET_URL || "",
        // The Hardhat network will by default fork from the latest mainnet block
        // To pin the block number, specify it below
        // You will need access to a node with archival data for this to work!
        // blockNumber: 14743877,
        // If you want to do some forking, set `enabled` to true
        enabled: false,
      },
    },
    mumbai: {
      chainId: 80001,
      url: process.env.ETH_MUMBAI_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: NETWORK_GAS_PRICE["mumbai"] || "auto",
    },
    polygon: {
      chainId: 137,
      url: process.env.ETH_POLYGON_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: NETWORK_GAS_PRICE["polygon"] || "auto",
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.ETH_SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: NETWORK_GAS_PRICE["sepolia"] || "auto",
    },
    main: {
      chainId: 1,
      url: process.env.ETH_MAINNET_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      gasPrice: NETWORK_GAS_PRICE["mainnet"] || "auto",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
    strict: true,
    only: [],
    except: [],
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};

task("deploy", "Deploys the contracts")
.setAction(async function () {
  const deployScript = await import("./scripts/deploy");
  await deployScript.main();
});


// Task: scheludeVesting
// Description: This task schedules the vesting of tokens for a specific wallet.
// Usage: Run this task by using the command `npx hardhat scheludeVesting --contratoVesting <contract_address> --wallet <wallet_address> --amount <amount> --startTime <start_time> --duration <duration> --percentToStart <percent_to_start> --cliff <cliff>`.
// Input: 
// - contratoVesting: The address of the vesting contract.
// - wallet: The address of the wallet.
// - amount: The amount of tokens to assign.
// - startTime: The start time of the vesting.
// - duration: The duration of the vesting.
// - percentToStart: The percentage of tokens to release at the start.
// - cliff: The cliff period in seconds.
// Output: Schedules the vesting of tokens and returns a confirmation message.
task("scheludeVesting", "Despliega el contrato vesting")
.addParam("contratovesting", "La dirección del contrato de vesting")
.addParam("wallet", "La dirección de la wallet")
.addParam("amount", "La cantidad de tokens a asignar")
.addParam("starttime", "El tiempo de inicio del vesting")
.addParam("duration", "La duración del vesting")
.addParam("percenttostart", "El porcentaje de tokens a liberar al inicio")
.addParam("cliff", "El periodo de cliff en segundos")
.setAction(async function (taskArgs) {
  const deployScript = await import("./scripts/scheludeVesting");
 
  await deployScript.main(taskArgs);
});

task("releaseVesting", "Despliega el contrato vesting")
.addParam("contratovesting", "La dirección del contrato de vesting")
.addParam("token", "La dirección de la wallet")
.addParam("wallet", "La dirección de la wallet")
.setAction(async function (taskArgs) {
  const deployScript = await import("./scripts/releaseVesting");
 
  await deployScript.main(taskArgs);
});

task("printVesting", "Despliega el contrato vesting")
.addParam("contratovesting", "La dirección del contrato de vesting")
.addParam("wallet", "La dirección de la wallet")
.setAction(async function (taskArgs) {
  const deployScript = await import("./scripts/printVestings");
 
  await deployScript.main(taskArgs);
});

task("blockVesting", "Despliega el contrato vesting")
.addParam("contratovesting", "La dirección del contrato de vesting")
.addParam("wallet", "La dirección de la wallet")
.addParam("num", "La cantidad de tokens a bloquear")
.setAction(async function (taskArgs) {
  const deployScript = await import("./scripts/blockVesting");
 
  await deployScript.main(taskArgs);
});

task("unblockVesting", "Despliega el contrato vesting")
.addParam("contratovesting", "La dirección del contrato de vesting")
.addParam("wallet", "La dirección de la wallet")
.addParam("num", "La cantidad de tokens a bloquear")
.setAction(async function (taskArgs) {
  const deployScript = await import("./scripts/unblockVesting");
 
  await deployScript.main(taskArgs);
});


export default config;