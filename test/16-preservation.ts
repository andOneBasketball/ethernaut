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
  const challengeFactory = await ethers.getContractFactory(`Preservation`);
  const challengeAddress = await createChallenge(
    `0x7ae0655F0Ee1e7752D7C62493CEa1E69A810e2ed`
  );
  challenge = await challengeFactory.attach(challengeAddress);
  const attackerFactory = await ethers.getContractFactory(
    `PreservationAttacker`
  );
  // attack is done in constructor
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
