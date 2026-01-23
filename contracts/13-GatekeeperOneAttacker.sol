pragma solidity ^0.7.3;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "hardhat/console.sol";

interface IGatekeeperOne {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperOneAttacker {
    using SafeMath for uint256;
    IGatekeeperOne public challenge;

    event AttackSuccess(uint256 gasOffset);

    constructor(address challengeAddress) {
        challenge = IGatekeeperOne(challengeAddress);
    }

    function attack(bytes8 gateKey) external {
        bytes memory payload = abi.encodeWithSignature(
            "enter(bytes8)",
            gateKey
        );

        // 8191 is the modulus used in gateTwo.
        // We multiply it by a factor to ensure there is enough gas
        // to reach the gate check, then fine-tune the remainder with +i.
        for (uint256 i = 0; i < 800; i++) {
            (bool ok, ) = address(challenge).call{gas: 8191 * 7 + i}(payload);
            if (ok) {
                emit AttackSuccess(i);
                return;
            }
        }
        revert("gateTwo not passed");
    }

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        console.log("gas used %s", gasleft());
        require(gasleft().mod(8191) == 0);
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        require(
            uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
            "GatekeeperOne: invalid gateThree part one"
        );
        require(
            uint32(uint64(_gateKey)) != uint64(_gateKey),
            "GatekeeperOne: invalid gateThree part two"
        );
        require(
            uint32(uint64(_gateKey)) == uint16(tx.origin),
            "GatekeeperOne: invalid gateThree part three"
        );
        _;
    }

    function testenter(
        bytes8 _gateKey
    )
        public
        // gateOne
        // gateTwo
        gateThree(_gateKey)
        returns (bool)
    {
        return true;
    }
}
