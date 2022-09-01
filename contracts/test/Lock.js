const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const {etherToWei} = require('../utils');
const axios = require("axios");

// deploying steps
//1. ERC20 mock
//2. Pool
//3. PoolAddressProvider
//4. MySimpleFlashLoanV3

describe("Testing MySwap Contract",()=>{
  let mySimpleFlashLoanV3Factory, mySimpleFlashLoanV3,deployer;
  beforeEach(async() =>{
    const aaveMainnetPoolAddressProvider = '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb';
// // const aaveGoreliFaucet = '0x1ca525Cd5Cb77DB5Fa9cBbA02A0824e283469DBe';
console.log("deploying....");
    mySimpleFlashLoanV3Factory = await ethers.getContractFactory("MySimpleFlashLoanV3");
    mySimpleFlashLoanV3 = await mySimpleFlashLoanV3Factory.deploy(aaveMainnetPoolAddressProvider);
    const [owner] = await ethers.getSigners();
    deployer = owner;
    const transactionHash = await owner.sendTransaction({
      to: mySimpleFlashLoanV3.address,
      value: ethers.utils.parseEther("2.0"), // Sends exactly 1.0 ether
    });
    await transactionHash.wait(1);
    console.log("contract address: ",mySimpleFlashLoanV3.address);
    // mySimpleFlashLoanV3 = await mySimpleFlashLoanV3.deployed();
  })
  it("calling executeFlashLoan() to swap USDC -> DAI",async () =>{
    const response = await axios.get(`https://polygon.api.0x.org/swap/v1/quote?buyToken=DAI&sellToken=USDC&sellAmount=1000000`)
    const assetContract ='0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const amount = 1000000;
    const buyToken =response.data.buyTokenAddress;
    const sellToken = response.data.sellTokenAddress;
    const allowanceTarget =response.data.allowanceTarget;
    const to = response.data.to;
    const data = response.data.data;
    const gasPrice = parseInt(response.data.gasPrice);
    const value = parseInt(response.data.value);
    console.log("asset contract:",response.data.protocolFee)
    // const contractResponse = await mySimpleFlashLoanV3.executeFlashLoan(assetContract,amount,assetContract,buyToken,allowanceTarget,to,data,gasPrice,value,{value:etherToWei(1,18)});
    await expect(mySimpleFlashLoanV3.executeFlashLoan(assetContract,amount,assetContract,buyToken,allowanceTarget,to,data,gasPrice,value,{value:etherToWei(1,18)})).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    // await expect(async ()=>await mySimpleFlashLoanV3.executeFlashLoan(assetContract,amount,assetContract,buyToken,allowanceTarget,to,data,gasPrice,value)).to.throw();
    // expect.fail("failed")
  })
})