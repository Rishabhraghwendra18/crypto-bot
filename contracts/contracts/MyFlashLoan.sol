// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IFlashLoanSimpleReceiver} from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";
import "hardhat/console.sol";

// interface IFaucet {
//     function mint(
//         address _token,
//         uint256 _amount
//     ) external;
// }

library StringHelper {
    function concat(bytes memory a, bytes memory b)
        internal
        pure
        returns (bytes memory)
    {
        return abi.encodePacked(a, b);
    }

    function getRevertMsg(bytes memory _returnData)
        internal
        pure
        returns (string memory)
    {
        if (_returnData.length < 68) return "Transaction reverted silently";

        assembly {
            _returnData := add(_returnData, 0x04)
        }

        return abi.decode(_returnData, (string));
    }
}

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
    using StringHelper for bytes;
    IERC20 public sellToken;
    IERC20 public buyToken;
    address public spender;
    address payable public swapTarget;
    bytes public swapCallData;
    address payable public owner;
    uint public gasPrice;
    uint public value;
    string val;

    // constructor(IPoolAddressesProvider _addressProvider)
    //     FlashLoanSimpleReceiverBase(_addressProvider)
    // {
    //     owner = payable(msg.sender);
    // }

    constructor(IPoolAddressesProvider _addressProvider)
        FlashLoanSimpleReceiverBase(_addressProvider)
    {
        owner = payable(msg.sender);
    }

    receive() external payable {
        console.log("received ethers", address(this).balance);
    }

    fallback() external payable {
        console.log("fallback is called!!");
    }

    function widthdrawAmount() internal {
        require(owner == msg.sender, "Only for owner");
        owner.transfer(10);
    }

    function getValues()
        public
        view
        returns (
            address,
            address,
            address,
            uint,
            uint
        )
    {
        console.log("value: ", address(this).balance);
        return (spender, swapTarget, owner, gasPrice, value);
    }

    function fillQuote()
        internal
    // Must attach ETH equal to the `value` field from the API response.
    {
        // Track our balance of the buyToken to determine how much we've bought.
        uint256 boughtAmount = sellToken.balanceOf(address(this));

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        require(sellToken.approve(spender, boughtAmount));
        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success, bytes memory data) = swapTarget.call{
            value: boughtAmount,
            gas: gasPrice + 1000000000000
        }(swapCallData);
        console.log("is swap success: ", boughtAmount);
        require(success, string(bytes('SWAP CALL FAILED: ').concat(bytes(data.getRevertMsg()))));
        console.log("swaped");
        // Refund any unspent protocol fees to the sender.
        // msg.sender.transfer(address(this).balance);
        // // Use our current buyToken balance to determine how much we've bought.
        // boughtAmount = buyToken.balanceOf(address(this)) - boughtAmount;
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
    ) external override returns (bool) {
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

    // function setter(
    //     address asset,
    //     uint256 amount,
    //     IERC20 _sellToken,
    //     IERC20 _buyToken,
    //     address allowanceTarget,
    //     address payable _to,
    //     uint _gasPrice,
    //     uint _value
    // ) public payable {
    //     address receiverAddress = address(this);

    //     bytes memory params = "";
    //     uint16 referralCode = 0;

    //     spender = allowanceTarget;
    //     swapTarget = _to;
    //     gasPrice = _gasPrice;
    //     value = _value;
    //     console.log("calling pool: ");
    //     POOL.flashLoanSimple(
    //         receiverAddress,
    //         asset,
    //         amount,
    //         params,
    //         referralCode
    //     );
    // }

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
        bytes calldata _data,
        uint _gasPrice,
        uint _value
    ) public payable {
        address receiverAddress = address(this);

        bytes memory params = "";
        uint16 referralCode = 0;

        sellToken = _sellToken;
        buyToken = _buyToken;
        spender = allowanceTarget;
        swapTarget = _to;
        swapCallData = _data;
        gasPrice = _gasPrice;
        value = _value;
        value = 123456789;
        val = "123456789";
        console.log("sellToken: ", msg.value);
        // require(address(0)!=spender,"No address provided to spender");

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }
}
