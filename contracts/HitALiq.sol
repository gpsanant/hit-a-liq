//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./UniV3Swapper.sol";
import {FlashLoanSimpleReceiverBase} from "./flash-loan/FlashLoanSimpleReceiverBase.sol";
import {ILendingPool, ILendingPoolAddressesProvider} from "./flash-loan/Interfaces.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./squeeth/contracts/interfaces/IController.sol";
import "./squeeth/contracts/interfaces/IWETH9.sol";

contract HitALiq is FlashLoanSimpleReceiverBase, UniV3Swapper {
    IWETH9 public constant WETH9 =
        IWETH9(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    IERC20 public constant oSQTH =
        IERC20(0xf1B99e3E573A1a9C5E6B2Ce818b617F0E664E86B);
    IController public constant sqthController =
        IController(0x64187ae08781B09368e6253F9E94951243A493D5);
    IERC20 public constant PROFIT_TOKEN =
        IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    ISwapRouter public constant SWAP_ROUTER =
        ISwapRouter(0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45);

    constructor(ILendingPoolAddressesProvider _addressProvider)
        FlashLoanSimpleReceiverBase(_addressProvider)
    {}

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // Approve the LendingPool contract allowance to *pull* the owed amount
        (uint256 vaultId, uint256 minerReward, uint256 liquiditionAmount) = abi
            .decode(params, (uint256, uint256, uint256));
        require(
            asset == address(WETH9),
            "Cannot borrow anything but WETH"
        );
        WETH9.approve(address(POOL), premium);
        swapExactOutputSingle(
            SWAP_ROUTER,
            address(WETH9),
            address(oSQTH),
            3000,
            liquiditionAmount,
            ~uint256(0)
        );
        IController(sqthController).liquidate(vaultId, amount);
        WETH9.deposit{value: address(this).balance - minerReward}();
        block.coinbase.transfer(minerReward);
        uint256 squeethBalance = WETH9.balanceOf(address(this));
        if (squeethBalance > 0) {
            swapExactInputSingle(
                SWAP_ROUTER,
                address(oSQTH),
                address(WETH9),
                3000,
                squeethBalance,
                address(this)
            );
        }
        swapExactInputSingle(
            SWAP_ROUTER,
            address(WETH9),
            address(PROFIT_TOKEN),
            500,
            WETH9.balanceOf(address(this)) - minerReward - premium,
            initiator
        );
        return true;
    }
}
