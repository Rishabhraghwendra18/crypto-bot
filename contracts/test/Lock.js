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
    transactionHash.wait(1);
    // mySimpleFlashLoanV3 = await mySimpleFlashLoanV3.deployed();
  })
  it("calling executeFlashLoan()",async () =>{
    const response = await axios.get(`https://polygon.api.0x.org/swap/v1/quote?buyToken=DAI&sellToken=USDC&sellAmount=1000000`)
    const assetContract ='0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    // const amount = etherToWei(10,6);
    const amount = 1000000;
    const buyToken =response.data.buyTokenAddress;
    const sellToken = response.data.sellTokenAddress;
    const allowanceTarget =response.data.allowanceTarget;
    const to = response.data.to;
    const data = response.data.data;
    const gasPrice = parseInt(response.data.gasPrice);
    const value = parseInt(response.data.value);
    console.log("amount: ",sellToken);
    try {
      const contractResponse = await mySimpleFlashLoanV3.executeFlashLoan(assetContract,amount,assetContract,buyToken,allowanceTarget,to,data,gasPrice,value,{value:ethers.utils.parseEther("2.0")});
      // const contractResponse = await mySimpleFlashLoanV3.setter(assetContract,amount,sellToken,buyToken,allowanceTarget,to,gasPrice,value);
      // const contractResponse = await mySimpleFlashLoanV3.setter(assetContract,amount,sellToken,buyToken,allowanceTarget,to,gasPrice,value);
      const buyTokenContract = await mySimpleFlashLoanV3.getValues();
      console.log("buyToken",buyTokenContract);

    } catch (error) {
      console.log("error: ",error)
      const buyTokenContract = await mySimpleFlashLoanV3.getValues();
      console.log("buyToken",buyTokenContract);
    }
    // const receipt = await response.wait();
    // mySimpleFlashLoanV3.on('Message',(setter,message,event)=>{
    //   console.log("event: ",message);
    // })
    // console.log("receipt: ",receipt)
  })
})