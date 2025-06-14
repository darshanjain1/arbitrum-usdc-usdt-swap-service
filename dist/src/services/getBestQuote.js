"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestQuote = getBestQuote;
const poolFactory_1 = require("./poolFactory");
const quoter_1 = require("./quoter");
async function getBestQuote(amountIn, slippageBps, provider, addresses) {
    const feeTiers = [100, 500, 3000];
    let best = { amountOut: 0n, fee: 0 };
    for (const fee of feeTiers) {
        try {
            const pool = await (0, poolFactory_1.getPoolWithLiquidity)(provider, addresses.USDC, addresses.USDT, fee);
            if (!pool)
                continue;
            const amountOut = await (0, quoter_1.getQuoteExactInputSingle)(provider, addresses.QUOTER_V2, {
                tokenIn: addresses.USDC,
                tokenOut: addresses.USDT,
                amountIn,
                fee,
            });
            if (amountOut > best.amountOut) {
                best = { amountOut, fee };
            }
        }
        catch (error) {
            console.error(error);
            continue;
        }
    }
    if (best.amountOut === 0n)
        throw new Error("No valid USDC/USDT pool found");
    // Slippage Adjusted Mininum Out
    const minAmountOut = best.amountOut * (10000n - BigInt(slippageBps)) / 10000n;
    return {
        amountOut: best.amountOut,
        slippageAdjustedAmountOut: minAmountOut,
        feeTier: best.fee,
    };
}
