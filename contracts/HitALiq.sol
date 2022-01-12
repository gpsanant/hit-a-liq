//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {FlashLoanReceiverBase} from "./flash-loan/FlashLoanReceiverBase.sol";
import {ILendingPool, ILendingPoolAddressesProvider} from "./flash-loan/Interfaces.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./squeeth/contracts/interfaces/IController.sol";
import "./squeeth/contracts/external/WETH9.sol";

contract HitALiq is FlashLoanReceiverBase {
    IERC20 public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    IERC20 public constant oSQTH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    constructor(ILendingPoolAddressesProvider _addressProvider)
        public
        FlashLoanReceiverBase(_addressProvider)
    {}

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Approve the LendingPool contract allowance to *pull* the owed amount
        (
            address swapRouter,
            address WETH,
            address oSQTH,
            uint24 poolFees,
            address sqthController,
            uint256 vaultId,
            uint256 liquiditionAmount,
            uint256 minerReward,
            bool swapFromWETH,
            address profitToken
        ) = abi.decode(params, (address, address, uint24, address, uint256, uint256));
        require(
            assets.length == 1 && assets[0] == WETH,
            "Cannot borrow anything but WETH"
        );
        uint256 ammountOwed = amounts[0] + premiums[0];
        IERC20(assets[0]).approve(address(LENDING_POOL), ammountOwed);
        ISwapRouter swapRouter = ISwapRouter(swapRouter);
        swapExactOutputSingle(
            swapRouter,
            WETH,
            oSQTH,
            poolFees,
            liquiditionAmount,
            amounts[0]
        );
        WETH9 weth = WETH9(WETH);
        IController(sqthController).liquidate(vaultId, liquiditionAmount);
        weth.deposit(address(this).balance - minerReward);
        payable(block.coinbase).sendValue(minerReward);
        if(swapFromWETH){
            swapExactInputSingle(swapRouter, WETH, profitToken, poolFees, address(this).balance - minerReward - ammountOwed, initializer);
            return true;
        } else {
            WETH9.transfer(initializer, address(this).balance - minerReward - ammountOwed);
        }
        
        return true;
    }

    function swapExactInputSingle(
            ISwapRouter swapRouter,
            address tokenIn,
            address tokenOut,
            uint24 poolFees,
            uint256 amountIn,
            address recipient
        ) external returns (uint256 amountOut) {
        // Approve the router to spend DAI.
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFees,
                recipient: recipient,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    function swapExactOutputSingle(
        ISwapRouter swapRouter,
        address tokenIn,
        address tokenOut,
        uint24 poolFees,
        uint256 amountOut,
        uint256 amountInMaximum
    ) internal returns (uint256 amountIn) {
        // Approve the router to spend the specifed `amountInMaximum` of DAI.
        // In production, you should choose the maximum amount to spend based on oracles or other data sources to acheive a better swap.
        TransferHelper.safeApprove(
            tokenIn,
            address(swapRouter),
            amountInMaximum
        );

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFees,
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: amountOut,
                amountInMaximum: amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountIn = swapRouter.exactOutputSingle(params);
    }
}
