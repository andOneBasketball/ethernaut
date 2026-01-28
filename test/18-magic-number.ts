import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  const challengeFactory = await ethers.getContractFactory(`MagicNum`);
  const challengeAddress = await createChallenge(
    `0x2132C7bc11De7A90B87375f282d36100a29f97a9`
  );
  challenge = await challengeFactory.attach(challengeAddress);

  const attackerFactory = await ethers.getContractFactory(`MagicNumAttacker`);
  attacker = await attackerFactory.deploy(challenge.target);
  await attacker.waitForDeployment();
});

it("solves the challenge", async function () {
  tx = await attacker.attack();
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
