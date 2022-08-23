// require('console.table')
const express = require('express');
const app = express();
const axios = require("axios");
const { etherToWei,weiToEther } = require('./utils');

const PORT=3000;
app.listen(PORT,()=>console.log(`Listening at ${PORT}`))

let TABLE_NUMBER=0;
function display(tableValues) {
    const table =[
        {
            buyToken:tableValues[0],
            sellToken:tableValues[1],
            "Sell Amount":tableValues[2],
            Value:tableValues[3],
            Price:tableValues[4],
            "Guarenteed Price":tableValues[5],
        }
    ]
    console.log("Table Number: ",TABLE_NUMBER);
    console.table(table);
    TABLE_NUMBER+=1;
}
async function fetchSwapQuote(sellToken,buyToken,sellAmount,slippagePercentage){
    try {
        const url =`https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`;
        console.log("url:",url);
        // process.exit(1);
        const response = await axios.get(`https://api.0x.org/swap/v1/quote?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&slippagePercentage=${slippagePercentage}`)
        const guarenteedPrice = response.data.guaranteedPrice;
        const value = response.data.value;
        const price = response.data.price;
        const buyAmount = response.data.buyAmount;
        
        // console.log(`response: `,guarenteedPrice); 
        return {
            price,
            guarenteedPrice,
            value,
            sellAmount,
            buyAmount,
        }
        // display([buyToken,sellToken,sellAmount,value,price,guarenteedPrice]);
        
    } catch (error) {
        console.log("error: ",error);
        process.exit(1);
    }
}

async function main() {
    const firstSwap=  await fetchSwapQuote('DAI','LINK',etherToWei(1),0.01);
    const secondSwap =  await fetchSwapQuote('LINK','DAI',firstSwap.buyAmount,0.01);
    console.log("second: ",weiToEther(firstSwap.buyAmount),weiToEther(secondSwap.buyAmount))
    console.log('\n');
    if(parseFloat(secondSwap.buyAmount)-etherToWei(1) > 0){
        console.log("MADE PROFIT !!!",weiToEther(parseFloat(secondSwap.buyAmount)-etherToWei(1)));
        // process.exit(1);
    }
    else{
        console.log("MADE LOSS!!",weiToEther(parseFloat(secondSwap.buyAmount)-etherToWei(1)))
    }

}
setInterval(async ()=>{await main()},3000)
