const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Testing MySwap Contract",()=>{
  let mySimpleFlashLoanV3Factory, mySimpleFlashLoanV3;
  beforeEach(async() =>{
    const aaveMainnetPoolAddressProvider = '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5';
// // const aaveGoreliFaucet = '0x1ca525Cd5Cb77DB5Fa9cBbA02A0824e283469DBe';
    mySimpleFlashLoanV3Factory = await ethers.getContractFactory("MySimpleFlashLoanV3");
    mySimpleFlashLoanV3 = await mySimpleFlashLoanV3Factory.deploy(aaveMainnetPoolAddressProvider);
    // mySimpleFlashLoanV3 = await mySimpleFlashLoanV3.deployed();
    console.log("deployed----");
  })
  it("Fetching contract address",async () =>{
    console.log("address: ");
  })
})