# ethernaut

My solutions to [Ethernaut CTF](https://ethernaut.openzeppelin.com/).
In-depth explanations for each level [can be read on my blog](https://cmichel.io/ethernaut-solutions/).

| Level | Name            | Key Vulnerability / Concept                       |
| ----- | --------------- | ------------------------------------------------- |
| 0     | Hello Ethernaut | Basic contract interaction & ABI calls            |
| 1     | Fallback        | Fallback/receive abuse → ownership takeover       |
| 2     | Fallout         | Misnamed constructor (old Solidity)               |
| 3     | Coin Flip       | Predictable on-chain randomness (blockhash)       |
| 4     | Telephone       | `tx.origin` phishing vulnerability                |
| 5     | Token           | Integer underflow (Solidity <0.8)                 |
| 6     | Delegation      | `delegatecall` overwriting storage                |
| 7     | Force           | Forced ETH via `selfdestruct`                     |
| 8     | Vault           | Private variables readable from storage           |
| 9     | King            | DoS via reverting receiver                        |
| 10    | Re-entrancy     | Reentrancy attack                                 |
| 11    | Elevator        | Interface spoofing / external state dependency    |
| 12    | Privacy         | Storage slot reading bypassing `private`          |
| 13    | Gatekeeper One  | Gas constraints & bitwise checks                  |
| 14    | Gatekeeper Two  | `extcodesize` bypass during construction          |
| 15    | Naught Coin     | ERC20 lock bypass via `transferFrom`              |
| 16    | Preservation    | Delegatecall + storage slot collision             |
| 17    | Recovery        | Predictable contract address (CREATE)             |
| 18    | MagicNumber     | Minimal bytecode / raw EVM opcodes                |
| 19    | Alien Codex     | Dynamic array underflow → arbitrary storage write |
| 20    | Denial          | Gas griefing DoS via external call                |
| 21    | Shop            | Malicious `view` function exploiting logic        |


## Development

```bash
npm i
```

You need to configure environment variables:

```bash
cp .env.template .env
# fill out
```

Pick a mnemonic and the resulting accounts will be used in the challenges.

#### Hardhat

This repo uses [hardhat](https://hardhat.org/) to run the CTF challenges.
Challenges are implemented as hardhat tests in [`/test`](./test).

The tests run on a local hardnet network but it needs to be forked from Rinkeby because it interacts with the challenge factory and submission contract.
To fork the Rinkeby testnet, you need an archive URL like the free ones from [Alchemy](https://alchemyapi.io/).

#### Running challenges

Optionally set the block number in the `hardhat.config.ts` hardhat network configuration to the rinkeby head block number such that the challenge contract is deployed.

```bash
# fork rinkeby but run locally
npx hardhat test test/0-hello.ts
```
