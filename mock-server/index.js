const express = require('express');
const cors = require('cors');
const app = express();
const {etherToWei,weiToEther} = require('./utils');

app.use(cors({
    origin:'*'
}));

app.get('/swap/v1/quote',(req,res)=>{
    console.log("hitting request")
    //random wrong values don't beleive on these
    let value=0;
    let allowanceTarget = "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39";
    let to = "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39";
    let data = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174dasgadsgasgasgasdgas";
    let protocolFee = 0;
    const {buyToken,sellToken} = req.query;

    // buyToken = LINK, sellToken = USDC
    if(buyToken === "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39" && sellToken === "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){ // LINK address
        res.send({
            guaranteedPrice:6.35,
            price:6.35,
            buyAmount:etherToWei(0.157639,18),
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        });
    }
    // buyToken = USDC, sellToken = LINK
    else if(buyToken ==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" && sellToken==="0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39"){
        res.send({
            guaranteedPrice:1.222222,
            price:1.22222,
            buyAmount:etherToWei(1.2222,6),
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        });
    }
    //buyToken = wETH, sellToken = USDC
    else if(buyToken==="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" && sellToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){
        res.send({
            guaranteedPrice:1405.35,
            price:1405.35,
            buyAmount:etherToWei(0.0006453,18),
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = USDC, sellToken=wETH
    else if(buyToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" && sellToken==="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"){
        res.send({
            guaranteedPrice:1.35,
            price:1.35,
            buyAmount:etherToWei(0.09123,6), // 0.09123
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = AVAX, sellToken = USDC
    else if(buyToken==="0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b" && sellToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){
        res.send({
            guaranteedPrice:19.88,
            price:19.88,
            buyAmount:0.0502891626854413,  
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    //buyToken=USDC, sellToken= AVAX
    else if(buyToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" && sellToken==="0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b"){
        res.send({
            guaranteedPrice:1.35,
            price:1.35,
            buyAmount:etherToWei(1.5,6), // 0.09123 
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken =wBTC, sellToken = USDC
    else if(buyToken === "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6" && sellToken === "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){
        res.send({
            guaranteedPrice:20000.88,
            price:20000.88,
            buyAmount:0.000048834706239699995,  
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = USDC && sellToken = wBTC
    else if(buyToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" && sellToken==="0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"){
        res.send({
            guaranteedPrice:1.35,
            price:1.35,
            buyAmount:etherToWei(1.3,6),
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = AAVE, sellToken = USDC
    else if(buyToken==="0xD6DF932A45C0f255f85145f286eA0b292B21C90B" && sellToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){
        res.send({
            guaranteedPrice:87.88,
            price:87.88,
            buyAmount:0.011412919424788899,  
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = USDC, sellToken = AAVE
    else if(buyToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" && sellToken==="0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"){
        res.send({
            guaranteedPrice:1.35,
            price:1.35,
            buyAmount:etherToWei(0.998,6),
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = 1inch, sellToken = USDC
    else if(buyToken==="0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f" && sellToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"){
        res.send({
            guaranteedPrice:1.88,
            price:1.88,
            buyAmount:1.4662756598240467,  
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
    // buyToken = USDC, sellToken=1inch
    else if(buyToken==="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" && sellToken==="0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f"){
        res.send({
            guaranteedPrice:1.00,
            price:1.00,
            buyAmount:etherToWei(0.996,6),
            buyTokenAddress:buyToken,
            sellTokenAddress:sellToken,
            value,
            allowanceTarget,
            to,
            data,
            protocolFee
        })
    }
})
app.listen(3001,()=>console.log("Mock server listening at 3001"));