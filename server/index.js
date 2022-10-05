// require('console.table')
require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const Web3 = require("web3");
const { etherToWei, weiToEther } = require("./utils");
const {tokens,baseTokens} = require('./tokens');
const contractABi = require('./abi/MySimpleFlashLoanV3.json').abi;

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening at ${PORT}`));

let TABLE_NUMBER = 0;
let TOTAL_PROFIT=0;
let isFoundArb = false;
const web3 = new Web3(process.env.RPC_URL || 'http://127.0.0.1:8545/');
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

function display(tableValues) {
  const table = [tableValues];
  console.log("Table Number: ", TABLE_NUMBER);
  console.table(table);
  TABLE_NUMBER += 1;
}
async function fetchSwapQuote(
  sellTokenAddress,
  buyTokenAddress,
  sellAmount,
  slippagePercentage
) {
  try {
    let url = `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyTokenAddress}&sellToken=${sellTokenAddress}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
    if(process.env.DEV === "development"){
      url=`http://localhost:3001/swap/v1/quote?buyToken=${buyTokenAddress}&sellToken=${sellTokenAddress}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
    }
    // console.log("url:", url);
    // process.exit(1);
    const response = await axios.get(
      url
    );
  const buyToken = response.data.buyTokenAddress;
  const sellToken = response.data.sellTokenAddress;
  const allowanceTarget = response.data.allowanceTarget;
  const to = response.data.to;
  const data = response.data.data;
  const gasPrice = parseInt(response.data.gasPrice);
  const value = parseInt(response.data.value);
  const buyAmount = response.data.buyAmount;
  let fee = response.data.protocolFee;
  const swapObj = {
    sellToken,
    buyToken,
    spender: allowanceTarget,
    swapTarget: to,
    swapCallData: data,
    gasPrice,
    value,
  };
  return [swapObj,buyAmount,fee];
    // display([buyToken,sellToken,sellAmount,value,price,guarenteedPrice]);
  } catch (error) {
    console.log("error: ", error);
    process.exit(1);
  }
}

async function executeTrade(firstSwap, secondSwap,token) {
  console.log("contract calling: ",token);
  const contractAddress = "0x6fd91ca8653bbc35164e753e1fcd6794c0c43fde";
  const assetContractAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  const contract = new web3.eth.Contract(contractABi, contractAddress);
try {
  // console.log("firstswap: ",firstSwap);
  const contractResponse = await contract.methods
    .executeFlashLoan(
      assetContractAddress,
      etherToWei(1,6),
     firstSwap,
     secondSwap
    )
    .send(
      { from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",gas:5500000,value:etherToWei(1,18)},
      function (error, txnHash) {
        if (error) {
          console.log("error: ", error);
        } else {
          console.log("txn hash: ", txnHash);
        }
      }
    );
    // console.log("contract response: ",contractResponse);
  
} catch (error) {
  console.log(`error: ${token}`,error)
}
    console.log("contract call executed!! ",token)
}
async function logic() {
  const flashLoanPremimumInEth = weiToEther(etherToWei(1,6)*0.0005,6);
  console.log("tokens: ",flashLoanPremimumInEth)
    const firstSwap = await fetchSwapQuote(baseTokens["USDC"], tokens["LINK"], etherToWei(1,6), 0.01);
    const secondSwap = await fetchSwapQuote(
      tokens["LINK"],
      baseTokens["USDC"],
      firstSwap[1],
      0.01
    );
    console.log("\n");
    console.log("secondSwap: ",etherToWei(1,6));
    if (weiToEther(parseFloat(secondSwap[1]) - etherToWei(1,6),6)-flashLoanPremimumInEth > 0) {
      isFoundArb=true;
      const profit = weiToEther(parseFloat(secondSwap[1]) - etherToWei(1,6),6)-flashLoanPremimumInEth;
      await executeTrade(firstSwap[0],secondSwap[0],"LINK");
      display({
          "Sell Token":"USDC",
          "Buy Token":"Link",
          "Sell Amount":weiToEther(secondSwap[1],6),  //USDC value
          "Buy Amount":weiToEther(firstSwap[1],18),
          "Profit":profit,
      });
      TOTAL_PROFIT+=parseFloat(profit);
      console.log("1st swap LINK bought: ",firstSwap[1]);
      // console.log("2nd swap fee: ",secondSwap[2]);
      console.log("Total Profit: ",TOTAL_PROFIT)
      // isFoundArb=false;
      return 1;
    } else {
      // executeTrade(firstSwap,secondSwap,"LINK");
      console.log(
        `MADE LOSS!! with LINK`,
        weiToEther(parseFloat(secondSwap[1]) - etherToWei(1,6),6)-weiToEther(500,6)
      );
      console.log("1st swap fee: ",weiToEther(firstSwap[1],18));
      console.log("2nd swap fee: ",weiToEther(secondSwap[1],6));
    }
}
async function main() {
  let profit =0;
 while (true) {
  profit=await logic();
   if(profit){
    console.log("calling profit: ");
    break;
   }
 }
}

main()
.catch((e) => console.log("error in main: ", e));
