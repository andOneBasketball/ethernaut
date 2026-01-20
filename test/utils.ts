import { Contract, Signer, LogDescription } from "ethers";
import { ethers } from "hardhat";

export const ETHERNAUT_ADDRESS = `0xa3e7317E591D5A0F1c605be1b3aC4D2ae56104d6`;

// manually copied from the website while inspect the web console's `ethernaut.abi`
const ETHERNAUT_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "contract Level",
        name: "level",
        type: "address",
      },
    ],
    name: "LevelCompletedLog",
    type: "event",
    signature:
      "0x9dfdf7e3e630f506a3dfe38cdbe34e196353364235df33e5a3b588488d9a1e78",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "instance",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "level",
        type: "address",
      },
    ],
    name: "LevelInstanceCreatedLog",
    type: "event",
    signature:
      "0x8be8bd7b4324b3d47aca5c3f64cb70e8f645e6fe94da668699951658f6384179",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
    signature:
      "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
  },
  {
    inputs: [
      {
        internalType: "contract Level",
        name: "_level",
        type: "address",
      },
    ],
    name: "createLevelInstance",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
    signature: "0xdfc86b17",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
    signature: "0x8da5cb5b",
  },
  {
    inputs: [
      {
        internalType: "contract Level",
        name: "_level",
        type: "address",
      },
    ],
    name: "registerLevel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x202023d4",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0x715018a6",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_instance",
        type: "address",
      },
    ],
    name: "submitLevelInstance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xc882d7c2",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
    signature: "0xf2fde38b",
  },
];

export const submitLevel = async (address: string) => {
  try {
    const ethernaut = await ethers.getContractAt(
      ETHERNAUT_ABI,
      ETHERNAUT_ADDRESS
    );
    let tx = await ethernaut.submitLevelInstance(address);
    const receipt = await tx.wait();

    if (receipt.logs.length === 0) return false;

    const event = ethernaut.interface.parseLog({
      topics: receipt.logs[0].topics,
      data: receipt.logs[0].data
    });
    return event.name === `LevelCompletedLog`;
  } catch (error) {
    console.error(`submitLevel: ${error.message}`);
    return false;
  }
};

export const createChallenge = async (
  contractLevel: string,
  value: any = `0`
) => {
  try {
    const ethernaut = await ethers.getContractAt(
      ETHERNAUT_ABI,
      ETHERNAUT_ADDRESS
    );
    let tx = await ethernaut.createLevelInstance(contractLevel, {
      value,
    });
    const receipt = await tx.wait();

    // console.log('Receipt logs:', receipt.logs);

    if (receipt.logs.length === 0) throw new Error(`No event found`);
    const events: LogDescription[] = receipt.logs
      .map((log) => {
        try {
          const parsed = ethernaut.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          // console.log('Parsed log:', parsed);
          return parsed;
        } catch (e) {
          // console.log('Failed to parse log:', log, e.message);
          return undefined;
        }
      })
      .filter(Boolean) as LogDescription[];

    // console.log('Events:', events);

    const event = events.find(
      (event) => event.name === `LevelInstanceCreatedLog` && event.args.instance
    );
    if (!event) throw new Error(`Invalid Event ${JSON.stringify(event)}`);

    return event.args.instance;
  } catch (error) {
    console.error(`createChallenge: ${error.message}`);
    throw new Error(`createChallenge failed: ${error.message}`);
  }
};
