"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuoteExactInputSingle = getQuoteExactInputSingle;
const ethers_1 = require("ethers");
const QUOTER_ABI = [
    'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)'
];
async function getQuoteExactInputSingle(provider, quoterAddress, params) {
    const quoter = new ethers_1.Contract(quoterAddress, QUOTER_ABI, provider);
    const { amountOut } = await quoter.quoteExactInputSingle.staticCall({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        fee: params.fee,
        sqrtPriceLimitX96: 0n
    });
    return amountOut;
}
