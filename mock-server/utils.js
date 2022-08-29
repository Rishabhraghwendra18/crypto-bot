const BigNumber = require('bignumber.js');

function etherToWei(etherAmount,decimals) {
    return new BigNumber(etherAmount)
        .times(`1e${decimals}`)
        .integerValue()
        .toString(10);
}
function weiToEther(weiAmount,decimals) {
    return new BigNumber(weiAmount)
        .div(`1e${decimals}`)
        .toString(10);
}

module.exports ={
    etherToWei,
    weiToEther,
}