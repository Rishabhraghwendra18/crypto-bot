// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {
        _mint(msg.sender, 1000000);
    }

    function mint(address recieverAddress, uint amount) public returns (bool) {
        _mint(recieverAddress, amount);
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
