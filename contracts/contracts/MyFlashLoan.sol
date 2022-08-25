// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;


import {
  IPoolAddressesProvider
} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";
import { IFlashLoanSimpleReceiver } from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import { IERC20 } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import { SafeMath } from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";
import 'hardhat/console.sol';
// interface IFaucet {
//     function mint(
//         address _token,
//         uint256 _amount
//     ) external;
// }

abstract contract FlashLoanSimpleReceiverBase is IFlashLoanSimpleReceiver {
  using SafeMath for uint256;

  IPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
  IPool public immutable override POOL;
//   IFaucet public immutable FAUCET;

//   constructor(IPoolAddressesProvider provider, IFaucet faucet) {
//     ADDRESSES_PROVIDER = provider;
//     POOL = IPool(provider.getPool());
//     FAUCET = faucet;
//   }

  constructor(IPoolAddressesProvider provider) {
    ADDRESSES_PROVIDER = provider;
    POOL = IPool(provider.getPool());
  }
}


/** 
    !!!
    Never keep funds permanently on your FlashLoanSimpleReceiverBase contract as they could be 
    exposed to a 'griefing' attack, where the stored funds are used by an attacker.
    !!!
 */
contract MySimpleFlashLoanV3 is FlashLoanSimpleReceiverBase {
    using SafeMath for uint256;
    IERC20 sellToken;
    IERC20 buyToken;
    address spender;
    address payable swapTarget;
    bytes swapCallData;
    address payable owner;

    constructor(IPoolAddressesProvider _addressProvider) FlashLoanSimpleReceiverBase(_addressProvider) {
        owner = payable(msg.sender);
    }
    function widthdrawAmount() internal {
        require(owner == msg.sender,"Only for owner");
        owner.transfer(10);
    }
    function fillQuote(
    )
        internal // Must attach ETH equal to the `value` field from the API response.
    {
        // Track our balance of the buyToken to determine how much we've bought.
        uint256 boughtAmount = buyToken.balanceOf(address(this));

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        require(sellToken.approve(spender, type(uint256).max));
        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success,) = swapTarget.call{value: msg.value}(swapCallData);
        require(success, 'SWAP_CALL_FAILED');
        // Refund any unspent protocol fees to the sender.
        // msg.sender.transfer(address(this).balance);
        console.log("is swap success: ",success);
        // // Use our current buyToken balance to determine how much we've bought.
        boughtAmount = buyToken.balanceOf(address(this)) - boughtAmount;
        // emit BoughtTokens(sellToken, buyToken, boughtAmount);
    }
    /**
        This function is called after your contract has received the flash loaned amount
     */
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    )
        external
        override
        returns (bool)
    {

        //
        // This contract now has the funds requested.
        // Your logic goes here.
        //

        fillQuote();
        
        // At the end of your logic above, this contract owes
        // the flashloaned amounts + premiums.
        // Therefore ensure your contract has enough to repay asset: 0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43
        // assetprovider: 0xc4dCB5126a3AfEd129BC3668Ea19285A9f56D15D
        // faucet: 0x1ca525Cd5Cb77DB5Fa9cBbA02A0824e283469DBe
        // these amounts.
        // Approve the LendingPool contract allowance to *pull* the owed amount
        uint amountOwed = amount.add(premium);
        // FAUCET.mint(asset,1000000000000);
        IERC20(asset).approve(address(POOL), amountOwed);
        // widthdrawAmount();
        return true;
    }

    function executeFlashLoan(
        address asset,
        uint256 amount,
        IERC20 _sellToken,
        // The `buyTokenAddress` field from the API response.
        IERC20 _buyToken,
        // The `allowanceTarget` field from the API response.
        address allowanceTarget,
        // The `to` field from the API response.
        address payable _to,
        // The `data` field from the API response.
        bytes calldata _data
    ) public {
        address receiverAddress = address(this);

        bytes memory params = "";
        uint16 referralCode = 0;

        sellToken = _sellToken;
        buyToken = _buyToken;
        spender = allowanceTarget;
        swapTarget = _to;
        swapCallData = _data;
        
        console.log("swap call data: ");

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }
}