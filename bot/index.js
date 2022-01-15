require("dotenv").config();
const Web3 = require("web3");
const web3 = new Web3(
    `https://mainnet.infura.io/v3/${process.env.PROJECT_ID}`
);
const Multicall = require('@dopex-io/web3-multicall');

const controllerAddress = "0x64187ae08781B09368e6253F9E94951243A493D5";
const shortPowerPerpAddress = "0xa653e22A963ff0026292Cc8B67941c0ba7863a38";
// ERC721 abi to interact with contract
const controllerAbi = [{ "inputs": [{ "internalType": "address", "name": "_oracle", "type": "address" }, { "internalType": "address", "name": "_shortPowerPerp", "type": "address" }, { "internalType": "address", "name": "_wPowerPerp", "type": "address" }, { "internalType": "address", "name": "_weth", "type": "address" }, { "internalType": "address", "name": "_quoteCurrency", "type": "address" }, { "internalType": "address", "name": "_ethQuoteCurrencyPool", "type": "address" }, { "internalType": "address", "name": "_wPowerPerpPool", "type": "address" }, { "internalType": "address", "name": "_uniPositionManager", "type": "address" }, { "internalType": "uint24", "name": "_feeTier", "type": "uint24" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }], "name": "BurnShort", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "DepositCollateral", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "DepositUniPositionToken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "oldFee", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newFee", "type": "uint256" }], "name": "FeeRateUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "oldFeeRecipient", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newFeeRecipient", "type": "address" }], "name": "FeeRecipientUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "liquidator", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "debtAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "collateralPaid", "type": "uint256" }], "name": "Liquidate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }], "name": "MintShort", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "oldNormFactor", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newNormFactor", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "lastModificationTimestamp", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "NormalizationFactorUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }], "name": "OpenVault", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "pausesLeft", "type": "uint256" }], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "wPowerPerpAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "payoutAmount", "type": "uint256" }], "name": "RedeemLong", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vauldId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "collateralAmount", "type": "uint256" }], "name": "RedeemShort", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "ethRedeemed", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "wPowerPerpRedeemed", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "wPowerPerpBurned", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "wPowerPerpExcess", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "bounty", "type": "uint256" }], "name": "ReduceDebt", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "indexForSettlement", "type": "uint256" }], "name": "Shutdown", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "unpauser", "type": "address" }], "name": "UnPaused", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "operator", "type": "address" }], "name": "UpdateOperator", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "WithdrawCollateral", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "vaultId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "WithdrawUniPositionToken", "type": "event" }, { "inputs": [], "name": "FUNDING_PERIOD", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "TWAP_PERIOD", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "applyFunding", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_powerPerpAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_withdrawAmount", "type": "uint256" }], "name": "burnPowerPerpAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_wPowerPerpAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_withdrawAmount", "type": "uint256" }], "name": "burnWPowerPerpAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_uniTokenId", "type": "uint256" }], "name": "depositUniPositionToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "ethQuoteCurrencyPool", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeRecipient", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeTier", "outputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32", "name": "_period", "type": "uint32" }], "name": "getDenormalizedMark", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32", "name": "_period", "type": "uint32" }], "name": "getDenormalizedMarkForFunding", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getExpectedNormalizationFactor", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32", "name": "_period", "type": "uint32" }], "name": "getIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32", "name": "_period", "type": "uint32" }], "name": "getUnscaledIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "indexForSettlement", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isShutDown", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isSystemPaused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }], "name": "isVaultSafe", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastFundingUpdateTimestamp", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastPauseTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_maxDebtAmount", "type": "uint256" }], "name": "liquidate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_powerPerpAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_uniTokenId", "type": "uint256" }], "name": "mintPowerPerpAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_wPowerPerpAmount", "type": "uint256" }, { "internalType": "uint256", "name": "_uniTokenId", "type": "uint256" }], "name": "mintWPowerPerpAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "normalizationFactor", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "name": "onERC721Received", "outputs": [{ "internalType": "bytes4", "name": "", "type": "bytes4" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "oracle", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "pausesLeft", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "quoteCurrency", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_wPerpAmount", "type": "uint256" }], "name": "redeemLong", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }], "name": "redeemShort", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }], "name": "reduceDebt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }], "name": "reduceDebtShutdown", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_newFeeRate", "type": "uint256" }], "name": "setFeeRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newFeeRecipient", "type": "address" }], "name": "setFeeRecipient", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "shortPowerPerp", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "shutDown", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unPauseAnyone", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unPauseOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "address", "name": "_operator", "type": "address" }], "name": "updateOperator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "vaults", "outputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "uint32", "name": "NftCollateralId", "type": "uint32" }, { "internalType": "uint96", "name": "collateralAmount", "type": "uint96" }, { "internalType": "uint128", "name": "shortAmount", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "wPowerPerp", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "wPowerPerpPool", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "weth", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_vaultId", "type": "uint256" }], "name": "withdrawUniPositionToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }];
const shortPowerPerpAbi = [{ "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "baseURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "controller", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_controller", "type": "address" }], "name": "init", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_recipient", "type": "address" }], "name": "mintNFT", "outputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
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
            // calls.push(controllerContract.methods.isVaultSafe(i))
            calls.push(controllerContract.methods.vaults(i))
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
