// require('console.table')
require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const Web3 = require("web3");
const { etherToWei, weiToEther } = require("./utils");

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening at ${PORT}`));

let TABLE_NUMBER = 0;
let TOTAL_PROFIT=0;
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
    const url = `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
    console.log("url:", url);
    // process.exit(1);
    const response = await axios.get(
      `https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`
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
  const firstSwap = await fetchSwapQuote("DAI", "Link", etherToWei(1), 0.01);
  const secondSwap = await fetchSwapQuote(
    "Link",
    "DAI",
    firstSwap.buyAmount,
    0.01
  );
//   console.log(
//     "second: ",
//     weiToEther(firstSwap.buyAmount),
//     weiToEther(secondSwap.buyAmount)
//   );
  console.log("\n");
  if (parseFloat(secondSwap.buyAmount) - etherToWei(1) > 0) {
    const profit = weiToEther(parseFloat(secondSwap.buyAmount) - etherToWei(1))
    // console.log(
    //   "MADE PROFIT !!!",
    //   weiToEther(parseFloat(secondSwap.buyAmount) - etherToWei(1))
    // );
    
    display({
        "Sell Token":"DAI",
        "Buy Token":"LINK",
        "Sell Amount":weiToEther(secondSwap.buyAmount),
        "Buy Amount":weiToEther(firstSwap.buyAmount),
        "Profit":profit,
    });
    TOTAL_PROFIT+=parseFloat(profit);
    console.log("1st swap fee: ",firstSwap.fee);
    console.log("2nd swap fee: ",secondSwap.fee);
    console.log("Total Profit: ",TOTAL_PROFIT)
    // await executeTrade(firstSwap, secondSwap);
    // process.exit(1);
  } else {
    console.log(
      "MADE LOSS!!",
      weiToEther(parseFloat(secondSwap.buyAmount) - etherToWei(1))
    );
    console.log("1st swap fee: ",firstSwap.fee);
    console.log("2nd swap fee: ",secondSwap.fee);
  }
}
setInterval(async () => {
  await main();
}, 3000);
// main().catch((e) => console.log("error in main: ", e));
