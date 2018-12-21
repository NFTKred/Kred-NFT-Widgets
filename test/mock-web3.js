export function mockWeb3() {
    global.ethereum = window.ethereum = {
        enable: () => Promise.resolve(['ETHEREUM_ACCOUNT_ID']),
    };
    global.web3 = window.web3 = {
        version: {
            network: '1',
        },
    };
    global.Web3 = function() {};
}

export function unmockWeb3() {
   // global.ethereum = global.web3 = global.Web3 = window.ethereum = window.web3 = undefined;
}
