const BigNumber = require('bignumber.js');

function etherToWei(etherAmount,decmial) {
    return new BigNumber(etherAmount)
        .times(`1e${decmial}`)
        .integerValue()
        .toString(10);
}
function weiToEther(weiAmount,decmial) {
    return new BigNumber(weiAmount)
        .div(`1e${decmial}`)
        .toString(10);
}

module.exports ={
    etherToWei,
    weiToEther,
}