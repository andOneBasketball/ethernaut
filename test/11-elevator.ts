import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
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
  const challengeFactory = await ethers.getContractFactory(`Elevator`);
  const challengeAddress = await createChallenge(
    `0x6DcE47e94Fa22F8E2d8A7FDf538602B1F86aBFd2`
  );
  challenge = await challengeFactory.attach(challengeAddress);

  const attackerFactory = await ethers.getContractFactory(`ElevatorAttacker`);
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
