import { run, ethers } from 'hardhat';

async function main() {
  await run('compile');

  const TestToken = await ethers.getContractFactory('TestToken');
  const ttInstance = await TestToken.deploy();

  const ttContract = await ttInstance.deployed();

  console.log(`TestToken deployed to: ${ttContract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  