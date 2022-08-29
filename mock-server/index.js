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
})
app.listen(3001,()=>console.log("Mock server listening at 3001"));