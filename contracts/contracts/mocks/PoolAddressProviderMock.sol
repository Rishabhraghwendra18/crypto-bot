// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.10;

// 1. transfer USDC to caller
// 2. token -> we need minitng function

contract PoolAddressProvider {
    address public POOL;

    constructor(address _pool) {
        POOL = _pool;
    }

    function getPool() public view returns (address) {
        return POOL;
    }
}
