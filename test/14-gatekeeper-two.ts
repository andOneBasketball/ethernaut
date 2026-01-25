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
  const challengeFactory = await ethers.getContractFactory(`GatekeeperTwo`);
  const challengeAddress = await createChallenge(
    `0x0C791D1923c738AC8c4ACFD0A60382eE5FF08a23`
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(
    `GatekeeperTwoAttacker`
  );
  // attack is done in constructor
  attacker = await attackerFactory.deploy(challenge.target);
  await attacker.waitForDeployment();
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
