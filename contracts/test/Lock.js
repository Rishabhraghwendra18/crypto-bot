const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { etherToWei } = require("../utils");
const axios = require("axios");

// deploying steps
//1. ERC20 mock
//2. Pool
//3. PoolAddressProvider
//4. MySimpleFlashLoanV3
let buyAmount = 0;
async function fetchQuote(sellTokenSymbol, buyTokenSymbol, sellAmount) {
  const response = await axios.get(
    `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyTokenSymbol}&sellToken=${sellTokenSymbol}&sellAmount=${sellAmount}`
  );
  buyAmount = response.data.buyAmount;
  console.log("in test buy amount: ", buyAmount);
  const buyToken = response.data.buyTokenAddress;
  const sellToken = response.data.sellTokenAddress;
  const allowanceTarget = response.data.allowanceTarget;
  const to = response.data.to;
  const data = response.data.data;
  const gasPrice = parseInt(response.data.gasPrice);
  const value = parseInt(response.data.value);
  const swapObj = {
    sellToken,
    buyToken,
    spender: allowanceTarget,
    swapTarget: to,
    swapCallData: data,
    gasPrice,
    value,
  };
  return swapObj;
}
describe("Testing MySwap Contract", () => {
  let mySimpleFlashLoanV3Factory, mySimpleFlashLoanV3, deployer;
  const assetContract = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const amount = 1000000;
  beforeEach(async () => {
    const Erc20Token = await ethers.getContractFactory("USDC");
    const erc20Token = await Erc20Token.deploy();
    await erc20Token.deployed();
    const erc20TokenAddress = erc20Token.address;

    const aaveMainnetPoolAddressProvider =
      "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
    // // const aaveGoreliFaucet = '0x1ca525Cd5Cb77DB5Fa9cBbA02A0824e283469DBe';
    console.log("deploying....");
    mySimpleFlashLoanV3Factory = await ethers.getContractFactory(
      "MySimpleFlashLoanV3"
    );
    mySimpleFlashLoanV3 = await mySimpleFlashLoanV3Factory.deploy(
      aaveMainnetPoolAddressProvider
    );

    console.log("contract address: ", mySimpleFlashLoanV3.address);
  });
  it("swapping USDC->DAI->USDC", async () => {
    console.log("\n swapping USDC->DAI->USDC");
    const swapObj = await fetchQuote(
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      amount
    );
    console.log("swap1 buy amount: ", buyAmount);
    const swapObj2 = await fetchQuote(
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      buyAmount
    );
    console.log("swap2 buy amount: ", buyAmount);
    buyAmount = 0;
    await expect(
      mySimpleFlashLoanV3.executeFlashLoan(
        assetContract,
        amount,
        swapObj,
        swapObj2,
        {
          value: etherToWei(1, 18),
        }
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });
});
