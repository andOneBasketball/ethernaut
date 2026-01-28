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
  const challengeFactory = await ethers.getContractFactory(`Denial`);
  const challengeAddress = await createChallenge(
    `0x2427aF06f748A6adb651aCaB0cA8FbC7EaF802e6`,
    ethers.parseUnits(`0.001`, `ether`)
  );
  challenge = await challengeFactory.attach(challengeAddress);

  const attackerFactory = await ethers.getContractFactory(`DenialAttacker`);
  attacker = await attackerFactory.deploy(challenge.target)
  await attacker.waitForDeployment();
});

it("solves the challenge", async function () {
  tx = await attacker.attack();
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
