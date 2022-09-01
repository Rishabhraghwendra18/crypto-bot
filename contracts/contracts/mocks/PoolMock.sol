// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.10;

interface IERC20 {
    function mint(address recieverAddress, uint amount) external returns (bool);
}

contract Pool {
    function flashLoanSimple(
        address recieverAddress,
        address asset,
        uint256 amount,
        bytes memory params,
        uint16 referralCode
    ) public {
        IERC20(asset).mint(recieverAddress, amount);
        // To do: call execute executeOperation()
    }
}
