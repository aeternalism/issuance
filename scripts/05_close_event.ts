import { run, ethers } from 'hardhat';
import configEnv from './00_config_env';

const CONTRACT_ADDRESS = configEnv.issuance_address;

async function main() {
  await run('compile');
  const [owner] = await ethers.getSigners();
  const issuance = await ethers.getContractAt('Issuance', CONTRACT_ADDRESS, owner);

  await issuance.closeEvent();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  