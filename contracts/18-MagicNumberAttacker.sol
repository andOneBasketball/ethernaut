pragma solidity ^0.7.3;

interface IMagicNum {
    function setSolver(address _solver) external;
}

contract MagicNumAttacker {
    IMagicNum public challenge;

    constructor(address challengeAddress) {
        challenge = IMagicNum(challengeAddress);
    }

    /*
    EVM does not know functions or ABI, only bytecode.

    Function calls are just CALL with calldata; decoding selectors is done by contract code, not by EVM.

    In MagicNumber, the solver ignores calldata and always returns 42.

    Runtime code only does:

    store 42 in memory

    RETURN 32 bytes → ABI-compatible uint256(42)

    Init code runs once at deployment and only returns the runtime code using CODECOPY + RETURN.

    So any function call (any selector) will still get 42 as return value.

    [ init code ]            [ runtime code ]
    600a600c600039600a6000f3 602a60005260206000f3

    602a60005260206000f3
    | bytes | des        |
    | ----- | ---------- |
    | 60 2a | PUSH1 0x2a |
    | 60 00 | PUSH1 0    |
    | 52    | MSTORE     |
    | 60 20 | PUSH1 32   |
    | 60 00 | PUSH1 0    |
    | f3    | RETURN     |

    600a600c600039600a6000f3
    PUSH size
    PUSH offset
    PUSH dest
    CODECOPY
    600a   ; size = 10
    600c   ; codeOffset = 12
    6000   ; memOffset = 0
    39     ; CODECOPY
     */
    function attack() public {
        bytes
            memory bytecode = hex"600a600c600039600a6000f3602a60005260206000f3";
        bytes32 salt = 0;
        address solver;

        assembly {
            solver := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }

        challenge.setSolver(solver);
    }
}
