// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IFlashLoanSimpleReceiver} from "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanSimpleReceiver.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";
import "hardhat/console.sol";

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
    struct Swap {
        IERC20 sellToken;
        IERC20 buyToken;
        address spender;
        address payable swapTarget;
        bytes swapCallData;
        uint gasPrice;
        uint value;
    }
    Swap public swap1;
    Swap public swap2;
    address payable public owner;
    // swap2
    // IERC20 public sellToken_swap2;
    // IERC20 public buyToken_swap2;
    // address public spender_swap2;
    // address payable public swapTarget_swap2;
    // bytes public swapCallData_swap2;
    // uint public gasPrice_swap2;
    // uint public value_swap2;

    bool private locked;
    modifier reentrancyGuard() {
        require(!locked, "Reentrancy Guard fired! Calling the contract again");
        locked = true;
        _;
        locked = false;
    }

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

    function widthdrawAmount() public {
        require(owner == msg.sender, "Only for owner");
        owner.transfer(10);
    }

    function fillQuote(
        IERC20 sellToken,
        IERC20 buyToken,
        address spender,
        address payable swapTarget,
        bytes memory swapCallData,
        uint gasPrice
    )
        internal
    // Must attach ETH equal to the `value` field from the API response.
    {
        // Track our balance of the buyToken to determine how much we've bought.
        uint256 boughtAmount = sellToken.balanceOf(address(this));

        // Give `spender` an infinite allowance to spend this contract's `sellToken`.
        // Note that for some tokens (e.g., USDT, KNC), you must first reset any existing
        // allowance to 0 before being able to update it.
        require(sellToken.approve(spender, boughtAmount));
        console.log("boughtAMount: ", boughtAmount);
        // Call the encoded swap function call on the contract at `swapTarget`,
        // passing along any ETH attached to this function call to cover protocol fees.
        (bool success, bytes memory data) = swapTarget.call{
            value: boughtAmount
        }(swapCallData);
        console.log("is swap success: ", boughtAmount);
        console.log(string(bytes("SWAP call data: ").concat(swapCallData)));
        require(
            success,
            string(
                bytes("SWAP CALL FAILED: ").concat(bytes(data.getRevertMsg()))
            )
        );
        console.log("swaped");
        // Refund any unspent protocol fees to the sender.
        // (bool returnSuccess,) = payable(msg.sender).call{value:address(this).balance}("");
        // require(returnSuccess,"Can't return the left amount to caller");
        // payable(msg.sender).transfer(address(this).balance);
        // console.log("send left over balance to caller: ",address(this).balance);
        // Use our current buyToken balance to determine how much we've bought.
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
        console.log("premium: ", premium);
        console.log("bought token amount: ",IERC20(asset).balanceOf(address(this)));
        // console.log("sell token amount: ",sellToken.balanceOf(address(this)));
        // console.log("1st swap buy: ", address(swap1.swapTarget));
        fillQuote(
            swap1.sellToken,
            swap1.buyToken,
            swap1.spender,
            swap1.swapTarget,
            swap1.swapCallData,
            swap1.gasPrice
        );

        // swap2
        console.log("calling swap2");
        fillQuote(
            swap2.sellToken,
            swap2.buyToken,
            swap2.spender,
            swap2.swapTarget,
            swap2.swapCallData,
            swap2.gasPrice
        );
        // after swap payback the loan
        uint amountOwed = amount.add(premium);
        uint amountGot = IERC20(swap2.buyToken).balanceOf(address(this));
        console.log("Amount Owed: ",amountOwed);
        console.log("Amount Got: ",amountGot);
        IERC20(asset).approve(address(POOL), amountOwed);
        // widthdrawAmount();
        return true;
    }

    function executeFlashLoan(
        address asset,
        uint256 amount,
        Swap memory _swap1,
        Swap memory _swap2
    ) public payable reentrancyGuard {
        address receiverAddress = address(this);

        bytes memory params = "";
        uint16 referralCode = 0;

        // sellToken_swap1 = _sellToken_swap1;
        // buyToken_swap1 = _buyToken_swap1;
        // spender_swap1 = allowanceTarget_swap1;
        // swapTarget_swap1 = _to_swap1;
        // swapCallData_swap1 = _data_swap1;
        // gasPrice_swap1 = _gasPrice_swap1;
        // value_swap1 = _value_swap1;
        swap1 = _swap1;
        swap2 = _swap2;
        // swap 2
        // sellToken_swap2 = _sellToken_swap2;
        // buyToken_swap2 = _buyToken_swap2;
        // spender_swap2 = allowanceTarget_swap2;
        // swapTarget_swap2 = _to_swap2;
        // swapCallData_swap2 = _data_swap2;
        // gasPrice_swap2 = _gasPrice_swap2;
        // value_swap2 = _value_swap2;

        POOL.flashLoanSimple(
            receiverAddress,
            asset,
            amount,
            params,
            referralCode
        );
    }
}

// Mocks needed for
// 1. PoolAddressProvider -> getPool();
// 2. getPool().flashLoanSimple() -> should call -> executeOperation();
// 3. getPool()  should pull out the tokens back.
