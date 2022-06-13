// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {IFlashLoanSimpleReceiver, ILendingPoolAddressesProvider, ILendingPool, IERC20  } from "./Interfaces.sol";
import { SafeERC20 } from "./Libraries.sol";

abstract contract FlashLoanSimpleReceiverBase is IFlashLoanSimpleReceiver {
  using SafeERC20 for IERC20;

  ILendingPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
  ILendingPool public immutable POOL;

  constructor(ILendingPoolAddressesProvider provider) {
    ADDRESSES_PROVIDER = provider;
    POOL = ILendingPool(provider.getLendingPool());
  }
}