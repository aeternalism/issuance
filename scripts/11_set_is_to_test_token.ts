import { run, ethers } from 'hardhat';
import configEnv from './00_config_env';

const CONTRACT_ADDRESS = configEnv.aes_address;
const ISSUANCE_ADDRESS = configEnv.issuance_address;

async function main() {
  await run('compile');
  const [owner] = await ethers.getSigners();
  const testToken = await ethers.getContractAt('TestToken', CONTRACT_ADDRESS, owner);

  await testToken.setIssuance(ISSUANCE_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  