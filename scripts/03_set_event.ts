import { run, ethers } from 'hardhat';
import { utils } from 'ethers';
import configEnv from './00_config_env';

const CONTRACT_ADDRESS = configEnv.issuance_address;

const PRIVATE_SALE = utils.formatBytes32String('PRIVATE SALE');
const PUBLIC_SALE = utils.formatBytes32String('PUBLIC SALE');

async function main() {
  await run('compile');
  const [owner] = await ethers.getSigners();
  const issuance = await ethers.getContractAt('Issuance', CONTRACT_ADDRESS, owner);

  await issuance.setEvent(PUBLIC_SALE);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  