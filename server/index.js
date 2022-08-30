// require('console.table')
require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const Web3 = require("web3");
const { etherToWei, weiToEther } = require("./utils");
const {tokens,baseTokens} = require('./tokens');

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening at ${PORT}`));

let TABLE_NUMBER = 0;
let TOTAL_PROFIT=0;
let isFoundArb = false;
const web3 = new Web3(process.env.RPC_URL);
web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

function display(tableValues) {
  const table = [tableValues];
  console.log("Table Number: ", TABLE_NUMBER);
  console.table(table);
  TABLE_NUMBER += 1;
}
async function fetchSwapQuote(
  sellToken,
  buyToken,
  sellAmount,
  slippagePercentage
) {
  try {
    let url = `https://polygon.api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
    if(process.env.DEV === "development"){
      url=`http://localhost:3001/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
    }
    console.log("url:", url);
    // process.exit(1);
    const response = await axios.get(
      url
    );
    const guarenteedPrice = response.data.guaranteedPrice;
    const value = response.data.value;
    const price = response.data.price;
    const buyAmount = response.data.buyAmount;
    const buyTokenAddress = response.data.buyTokenAddress;
    const sellTokenAddress = response.data.sellTokenAddress;
    const allowanceTarget = response.data.allowanceTarget;
    const to = response.data.to;
    const data = response.data.data;
    let fee = response.data.protocolFee;

    // console.log(`response: `,guarenteedPrice);
    return {
      price,
      guarenteedPrice,
      value,
      sellAmount,
      buyAmount,
      buyTokenAddress,
      sellTokenAddress,
      allowanceTarget,
      to,
      data,
      fee,
    };
    // display([buyToken,sellToken,sellAmount,value,price,guarenteedPrice]);
  } catch (error) {
    console.log("error: ", error);
    process.exit(1);
  }
}

async function executeTrade(firstSwap, secondSwap) {
  const contractABi = [
    {
      inputs: [
        {
          internalType: "contract IPoolAddressesProvider",
          name: "_addressProvider",
          type: "address",
        },
        {
          internalType: "contract IFaucet",
          name: "_faucet",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "ADDRESSES_PROVIDER",
      outputs: [
        {
          internalType: "contract IPoolAddressesProvider",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "FAUCET",
      outputs: [
        {
          internalType: "contract IFaucet",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "POOL",
      outputs: [
        {
          internalType: "contract IPool",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "asset",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "contract IERC20",
          name: "_sellToken",
          type: "address",
        },
        {
          internalType: "contract IERC20",
          name: "_buyToken",
          type: "address",
        },
        {
          internalType: "address",
          name: "allowanceTarget",
          type: "address",
        },
        {
          internalType: "address payable",
          name: "_to",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "_data",
          type: "bytes",
        },
      ],
      name: "executeFlashLoan",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "asset",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "premium",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "initiator",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "params",
          type: "bytes",
        },
      ],
      name: "executeOperation",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  const contractAddress = "0x5CFFb70572C0C1442531CccD115f3507D39AB278";
  const assetContractAddress = "0xA2025B15a1757311bfD68cb14eaeFCc237AF5b43";
  const contract = new web3.eth.Contract(contractABi, contractAddress);

  const contractResponse = await contract.methods
    .executeFlashLoan(
      assetContractAddress,
      etherToWei(1),
      firstSwap.sellTokenAddress,
      firstSwap.buyTokenAddress,
      firstSwap.allowanceTarget,
      firstSwap.to,
      firstSwap.data
    )
    .send(
      { from: "0xA2bbE509D55a7F5623fB8e820c5BC0B93dC57750", gas: 25576 },
      function (error, txnHash) {
        if (error) {
          console.log("error: ", error);
        } else {
          console.log("txn hash: ", txnHash);
        }
      }
    );
    console.log("contract response: ",contractResponse);
}
async function main() {
  const flashLoanPremimumInEth = weiToEther(etherToWei(1,6)*0.0005,6);
  for(const token in tokens){
    console.log("tokens: ",token)
    const firstSwap = await fetchSwapQuote(baseTokens["USDC"], tokens[token], etherToWei(1,6), 0.01);
    const secondSwap = await fetchSwapQuote(
      tokens[token],
      baseTokens["USDC"],
      firstSwap.buyAmount,
      0.01
    );
    console.log("\n");
    if (weiToEther(parseFloat(secondSwap.buyAmount) - etherToWei(1,6),6)-flashLoanPremimumInEth > 0) {
      isFoundArb=true;
      const profit = weiToEther(parseFloat(secondSwap.buyAmount) - etherToWei(1,6),6)-flashLoanPremimumInEth;
      display({
          "Sell Token":"USDC",
          "Buy Token":token,
          "Sell Amount":weiToEther(secondSwap.buyAmount,6),
          "Buy Amount":weiToEther(firstSwap.buyAmount,18),
          "Profit":profit,
      });
      TOTAL_PROFIT+=parseFloat(profit);
      console.log("1st swap fee: ",firstSwap.fee);
      console.log("2nd swap fee: ",secondSwap.fee);
      console.log("Total Profit: ",TOTAL_PROFIT)
      isFoundArb=false;
    } else {
      console.log(
        `MADE LOSS!! with ${token}`,
        weiToEther(parseFloat(secondSwap.buyAmount) - etherToWei(1,6),6)-weiToEther(500,6)
      );
      console.log("1st swap fee: ",weiToEther(firstSwap.buyAmount,18));
      console.log("2nd swap fee: ",weiToEther(secondSwap.buyAmount,6));
    }
  }
}
setInterval(async () => {
  if(!isFoundArb){
    await main();
  }
}, 3000);
// main().catch((e) => console.log("error in main: ", e));
