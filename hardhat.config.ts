import { HardhatUserConfig, task } from 'hardhat/config';
import configEnv from './scripts/00_config_env';

import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import "hardhat-gas-reporter";

const ROPSTEN_INFURA_ENDPOINT = process.env.ROPSTEN_INFURA_ENDPOINT;
const ROPSTEN_ACCOUNT_PRIVATE_KEY = process.env.ROPSTEN_ACCOUNT_PRIVATE_KEY;
const HOMESTEAD_INFURA_ENDPOINT = process.env.HOMESTEAD_INFURA_ENDPOINT;
const HOMESTEAD_ACCOUNT_PRIVATE_KEY = process.env.HOMESTEAD_ACCOUNT_PRIVATE_KEY;

const NETWORK = process.env.NETWORK;

const config : HardhatUserConfig = {
  defaultNetwork: configEnv.network,
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      chainId: 1337,
      url: 'http://127.0.0.1:8545',
    },
    ropsten: {
      chainId: 3,
      url: ROPSTEN_INFURA_ENDPOINT,
      accounts: [`0x${ROPSTEN_ACCOUNT_PRIVATE_KEY}`],
      gas: 2300000,
      loggingEnabled: true,
      blockGasLimit: 95000000
    },
    homestead: {
      chainId: 1,
      url: HOMESTEAD_INFURA_ENDPOINT,
      accounts: [`0x${HOMESTEAD_ACCOUNT_PRIVATE_KEY}`],
      gasPrice: 30000000000
    }
  },
  solidity: {
    version: '0.7.5',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: './contracts',
    tests: './test'
  },
  gasReporter: {
    currency: 'USD',
    enabled:  process.env.REPORT_GAS ? true : false
  }
}

task('stat', 'Print current event statistics')
  .setAction(async (args, hre) => {
    const CONTRACT = configEnv.issuance_address;
    const WALLET = configEnv.payable_wallet;

    const { ethers } = hre;
    const [owner] = await ethers.getSigners();
    const issuance = await ethers.getContractAt('Issuance', CONTRACT, owner);

    const currentEvent = await issuance.currentEvent();
    const currentStage = await issuance.currentStage();
    const event = await issuance.saleEvents(currentEvent);
    const invested = await issuance.investments(WALLET);
    
    console.log('event', ethers.utils.parseBytes32String(currentEvent));
    console.log('state', ethers.utils.parseBytes32String(currentStage));
    
    console.log('wallet', WALLET, ', invest into', CONTRACT, ', AES:', ethers.utils.formatEther(invested));
    console.log('deployer ETH', ethers.utils.formatEther(await owner.getBalance()));
    console.log('issuance price', event.issuancePrice.toNumber());
    console.log('fund goal', ethers.utils.formatUnits(event.fundGoal, 18));
    console.log('balance', ethers.utils.formatEther(await ethers.provider.getBalance(CONTRACT)));
  });

export default config;
