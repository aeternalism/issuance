import { run, ethers } from 'hardhat';

async function main() {
  await run('compile');

  const Issuance = await ethers.getContractFactory('Issuance');
  const isInstance = await Issuance.deploy();

  const isContract = await isInstance.deployed();

  console.log(`Issuance deployed to: ${isContract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  