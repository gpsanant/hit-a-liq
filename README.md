# HitALiq

A no exposure, flashloan, MEV based liquidation strategy for [Squeeth]() (an implementation of Power Perps in Etherum). 

As their docs eloquently put it, "Shorting eth² is risky because you can never fully collateralize your debt. If eth price doubles, your debt goes 4x, while your collateral value is only 2x." So it seems as thought liquidation is more likely when collateralizing a highly volatile asset.

This strategy works as following:

1. An "initializer" (EOA or another contract) takes a WETH9 flashloan on behalf of a HitALiq
2. HitALiq swaps for the liquidation amount of oSQTH
3. HitALiq liquidates the given vault



