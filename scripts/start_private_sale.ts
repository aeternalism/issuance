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

  await issuance.setupEvent(PRIVATE_SALE, 5500, 2, 5, 40, 1609372800);
  await issuance.setupEvent(PUBLIC_SALE, 4675, 2, 100, 100, 1612051200);

  await issuance.setEvent(PRIVATE_SALE);
  await issuance.startEvent();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  