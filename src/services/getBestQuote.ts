import { JsonRpcProvider } from 'ethers';
import { getPoolWithLiquidity } from './poolFactory';
import { getQuoteExactInputSingle } from './quoter';

interface Addresses {
  USDC: string;
  USDT: string;
  QUOTER_V2: string;
}

export async function getBestQuote(
  amountIn: bigint,
  slippageBps: number,
  provider: JsonRpcProvider,
  addresses: Addresses
) {
  const feeTiers = [100, 500, 3000];
  let best = { amountOut: 0n, fee: 0 };

  for (const fee of feeTiers) {
    try {
      const pool = await getPoolWithLiquidity(provider, addresses.USDC, addresses.USDT, fee);
      if (!pool) continue;

      const amountOut = await getQuoteExactInputSingle(provider, addresses.QUOTER_V2, {
        tokenIn: addresses.USDC,
        tokenOut: addresses.USDT,
        amountIn,
        fee,
      });

      if (amountOut > best.amountOut) {
        best = { amountOut, fee };
      }
    } catch (error) {
      console.error( error);
      continue;
    }
  }

  if (best.amountOut === 0n) throw new Error("No valid USDC/USDT pool found");

  // Slippage Adjusted Mininum Out
  const minAmountOut = best.amountOut * (10_000n - BigInt(slippageBps)) / 10_000n;
  return {
    amountOut: best.amountOut,
    slippageAdjustedAmountOut: minAmountOut,
    feeTier: best.fee,
  };
}