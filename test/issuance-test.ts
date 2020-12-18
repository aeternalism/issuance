import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Contract, utils } from 'ethers';
import { ethers } from 'hardhat';

describe('Issuance', () => {
  let issuance: Contract;
  const PRI_SALE = utils.formatBytes32String('PRI SALE');
  const PUB_SALE = utils.formatBytes32String('PUB SALE');

  const OPEN_STAGE = utils.formatBytes32String('OPEN');
  const WITHDRAW_STAGE = utils.formatBytes32String('WITHDRAW');

  beforeEach(async () => {
    issuance = await (
      await (await ethers.getContractFactory('Issuance')).deploy()
    ).deployed();
  });

  it('Set issuance', async () => {
    // TETHER address
    await issuance.setIssuanceToken(
      '0xdac17f958d2ee523a2206206994597c13d831ec7'
    );
  });

  it('Set issuance by non owner', async () => {
    const [, addr1] = await ethers.getSigners();
    await expect(
      issuance
        .connect(addr1)
        .setIssuanceToken('0xdac17f958d2ee523a2206206994597c13d831ec7')
    ).to.be.revertedWith('caller is not the owner');
  });

  it('Set issuance with address 0x0', async () => {
    await expect(
      issuance.setIssuanceToken('0x0000000000000000000000000000000000000000')
    ).to.be.revertedWith('Issuance is 0x0');
  });

  it('Setup event', async () => {
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);

    // expect(
    //   (await issuance.saleEvents(PRI_SALE))
    //     .issuancePrice
    // ).to.equal(5500);
  });

  it('Setup event by non owner', async () => {
    const [, addr1] = await ethers.getSigners();
    await expect(
      issuance
        .connect(addr1)
        .setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800)
    ).to.be.revertedWith('caller is not the owner');
  });

  it('Setup event at non SETUP stage', async () => {
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();

    await expect(
      issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800)
    ).to.be.revertedWith('Not allow at this stage');
  });

  it('Setup event with invalid fields', async () => {
    await expect(
      issuance.setupEvent(PRI_SALE, 0, 2, 5, 40, 1609372800)
    ).to.be.revertedWith('Negative issuance price');

    await expect(
      issuance.setupEvent(PRI_SALE, 5500, 0, 5, 40, 1609372800)
    ).to.be.revertedWith('Negative min deposit');

    await expect(
      issuance.setupEvent(PRI_SALE, 5500, 2, -1, 40, 1609372800)
    ).to.be.reverted;

    await expect(
      issuance.setupEvent(PRI_SALE, 5500, 2, 5, 0, 1609372800)
    ).to.be.revertedWith('Negative fund goal');

    await expect(
      issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1600000000)
    ).to.be.revertedWith('Time end in the past');
  });

  it('Start event', async () => {
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();

    expect(await issuance.currentEvent()).to.equal(PRI_SALE);
    expect(await issuance.currentStage()).to.equal(OPEN_STAGE)
  });

  it('Start event at non SETUP stage', async () => {
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();

    await expect(issuance.startEvent()).to.be.revertedWith(
      'Transition not found'
    );
  });

  it('Close event', async () => {
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await issuance.closeEvent();

    expect(await issuance.currentStage()).to.equal(
      utils.formatBytes32String('CLOSE')
    );
  });

  it('Close event at non OPEN stage', async () => {
    await expect(issuance.closeEvent()).to.be.revertedWith(
      'Transition not found'
    );
  });

  it('Withdraw event', async () => {
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await issuance.closeEvent();
    await issuance.withdrawEvent();

    expect(await issuance.currentStage()).to.equal(WITHDRAW_STAGE);
  });

  it('Withdraw event at non CLOSE stage', async () => {
    await expect(issuance.withdrawEvent()).to.be.revertedWith(
      'Transition not found'
    );
  });

  it('Re setup event', async () => {
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await issuance.closeEvent();
    await issuance.withdrawEvent();
    await issuance.reSetupEvent();

    expect(await issuance.currentStage()).to.equal(
      utils.formatBytes32String('SETUP')
    );
  });

  it('Re setup event at non WITHDRAW stage', async () => {
    await expect(issuance.withdrawEvent()).to.be.revertedWith(
      'Transition not found'
    );
  });

  it('Close and open next event', async () => {
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    await issuance.setupEvent(PUB_SALE, 4675, 2, 100, 60, 1609372800);

    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await issuance.setEvent(PUB_SALE);

    expect(await issuance.currentStage()).to.equal(OPEN_STAGE);
    expect(await issuance.currentEvent()).to.equal(PUB_SALE);
  });

  it('Close and open next event by non owner', async () => {
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    await issuance.setupEvent(PUB_SALE, 4675, 2, 100, 60, 1609372800);

    const [, addr1] = await ethers.getSigners();
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await expect(
      issuance
        .connect(addr1)
        .setEvent(PUB_SALE)
    ).to.be.revertedWith('caller is not the owner');
  });

  it('Close and open next event at non OPEN stage', async () => {
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    await issuance.setupEvent(PUB_SALE, 4675, 2, 100, 60, 1609372800);

    const [] = await ethers.getSigners();
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await issuance.closeEvent();
    await expect(
      issuance
        .setEvent(PUB_SALE)
    ).to.be.revertedWith('Not allow at this stage');
  });

  it('Invest', async () => {
    const [, addr1] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    // invest
    await issuance.connect(addr1).invest({
      value: utils.parseEther('5'),
    });

    const eth = await ethers.provider.getBalance(issuance.address);

    expect(utils.formatEther(eth)).to.equal('5.0');
  });

  it('Invest at non OPEN stage', async () => {
    const [, addr1] = await ethers.getSigners();
    // invest
    await expect(
      issuance.connect(addr1).invest({
        value: utils.parseEther('5'),
      })
    ).to.be.reverted;
  });

  it('Invest deposit amount out of range', async () => {
    const [, addr1] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    // invest
    await expect(
      issuance.connect(addr1).invest({
        value: utils.parseEther('1.5'),
      })
    ).to.be.revertedWith('Deposited less than minimum amount');

    await expect(
      issuance.connect(addr1).invest({
        value: utils.parseEther('5.1'),
      })
    ).to.be.revertedWith('Deposited larger than maximum amount');
  });

  it('Invest deposit when goal reached', async () => {
    const [, addr1] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 5, 1609372800);
    await issuance.setupEvent(PUB_SALE, 4675, 2, 100, 5, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    await issuance.setEvent(PUB_SALE);
    // invest
    await issuance.connect(addr1).invest({
      value: utils.parseEther('5'),
    });

    await expect(
      issuance.connect(addr1).invest({
        value: utils.parseEther('10'),
      })
    ).to.be.revertedWith('Goal reached, see you next time');
  });

  it('Withdraw', async () => {
    const [, addr1] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    // invest
    await issuance.connect(addr1).invest({
      value: utils.parseEther('5'),
    });
    await issuance.connect(addr1).invest({
      value: utils.parseEther('4'),
    });
    // set issuance token
    const token = await (
      await (await ethers.getContractFactory('TestToken')).deploy()
    ).deployed();
    await issuance.setIssuanceToken(token.address);
    // withdraw
    await issuance.closeEvent();
    await issuance.withdrawEvent();
    await issuance.connect(addr1).withdraw();

    // Mint amount = Deposited ETH * price = (5 + 4) * 5500 = 27500
    expect(utils.formatUnits(await token.balanceOf(addr1.address))).to.equal(
      '49500.0'
    );
  });

  it('Withdraw at non WITHDRAW stage', async () => {
    const [, addr1] = await ethers.getSigners();
    await expect(issuance.connect(addr1).withdraw()).to.be.revertedWith(
      'Not allow at this stage'
    );
  });

  it('Withdraw multiple times', async () => {
    const [, addr1] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    // invest
    await issuance.connect(addr1).invest({
      value: utils.parseEther('5'),
    });
    // set issuance token
    const token = await (
      await (await ethers.getContractFactory('TestToken')).deploy()
    ).deployed();
    await issuance.setIssuanceToken(token.address);
    // withdraw
    await issuance.closeEvent();
    await issuance.withdrawEvent();
    await issuance.connect(addr1).withdraw();
    await expect(issuance.connect(addr1).withdraw()).to.be.revertedWith(
      'Already withdrawn'
    );
  });

  it('Transfer fund', async () => {
    const [, addr1, addr2] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    // invest
    await issuance.connect(addr1).invest({
      value: utils.parseEther('5'),
    });
    // withdraw and transfer
    await issuance.closeEvent();
    await issuance.withdrawEvent();
    await issuance.transferFund(addr2.address);

    const eth = await ethers.provider.getBalance(addr2.address);

    expect(utils.formatEther(eth)).to.equal('10005.0');
  });

  it('Transfer fund by non owner', async () => {
    const [, addr1, addr2] = await ethers.getSigners();
    // setup event
    await issuance.setupEvent(PRI_SALE, 5500, 2, 5, 40, 1609372800);
    // start
    await issuance.setEvent(PRI_SALE);
    await issuance.startEvent();
    // invest
    await issuance.connect(addr1).invest({
      value: utils.parseEther('5'),
    });
    // withdraw and transfer
    await issuance.closeEvent();
    await issuance.withdrawEvent();
    await expect(
      issuance.connect(addr2).transferFund(addr2.address)
    ).to.be.revertedWith('caller is not the owner');

    await expect(
      issuance.transferFund('0x0000000000000000000000000000000000000000')
    ).to.be.revertedWith('Transfer to 0x0 address');
  });

});
