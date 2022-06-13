require("dotenv").config();
const abi = require("./abi.json");
const Web3 = require("web3");
console.log(process.env.PROJECT_ID)
const web3 = new Web3(
    `https://mainnet.infura.io/v3/${process.env.PROJECT_ID}`
);
const Multicall = require('@dopex-io/web3-multicall');

const controllerAddress = "0x64187ae08781B09368e6253F9E94951243A493D5";
const shortPowerPerpAddress = "0xa653e22A963ff0026292Cc8B67941c0ba7863a38";
// ERC721 abi to interact with contract
const controllerAbi = abi.controllerAbi;
const shortPowerPerpAbi = abi.shortPowerPerpAbi;
// interact with contract
const controllerContract = new web3.eth.Contract(controllerAbi, controllerAddress);
const shortPowerPerpContract = new web3.eth.Contract(shortPowerPerpAbi, shortPowerPerpAddress);

const multicall = new Multicall({
    chainId: 1,
    provider: `https://mainnet.infura.io/v3/${process.env.PROJECT_ID}`,
  });

async function getUnsafeVaults(storedCalls, checkNumber) {
    var calls = storedCalls
    if (checkNumber % 10 == 0) {
        var nextVaultId = await shortPowerPerpContract.methods.nextId().call()
        console.log(nextVaultId)
        for (var i = calls.length + 1; i < nextVaultId; i++) {
            calls.push(controllerContract.methods.isVaultSafe(i))
            // calls.push(controllerContract.methods.vaults(i))
        }
    }

    const statuses = await multicall.aggregate(calls);
    console.log(statuses)
    const unsafeVaults = []
    for(var i = 0; i < statuses.length; i++) {
        if(!statuses[i]) unsafeVaults.push(i+1)
    }
    return unsafeVaults
}

(async() => {
    var x = await getUnsafeVaults([], 0)
    console.log(x)
})()
