import { JsonRpcProvider } from "ethers";
import { getPoolWithLiquidity } from "./poolFactory";
import { getQuoteExactInputSingle } from "./quoter";
import { config } from "../config";

interface Addresses {
  USDC: string;
  USDT: string;
  QUOTER_V2: string;
}

export async function getBestQuote(
  amountIn: bigint,
  slippageBps: number,
  provider: JsonRpcProvider,
  addresses: Addresses,
) {
  const feeTiers = [100, 500, 3000];
  let best = { amountOut: 0n, feeTier: 0 };
  let skippedDueToGas: number[] = [];

  for (const feeTier of feeTiers) {
    try {
      const pool = await getPoolWithLiquidity(provider, addresses.USDC, addresses.USDT, feeTier);
      if (!pool) continue;

      const { amountOut, gasEstimate } = await getQuoteExactInputSingle(
        provider,
        addresses.QUOTER_V2,
        {
          tokenIn: addresses.USDC,
          tokenOut: addresses.USDT,
          amountIn,
          fee: feeTier,
        },
      );

      if (gasEstimate > BigInt(config.GAS_LIMIT)) {
        console.warn(
          `Skipping fee tier ${feeTier}: Estimated gas ${gasEstimate} exceeds limit ${config.GAS_LIMIT}`,
        );
        skippedDueToGas.push(feeTier);
        continue;
      }

      if (amountOut > best.amountOut) {
        best = { amountOut, feeTier };
      }
    } catch (error) {
      console.error(`Error in fee tier ${feeTier}:`, error);
      continue;
    }
  }

  if (best.amountOut === 0n) {
    if (skippedDueToGas.length === feeTiers.length) {
      throw new Error(
        `All available pools were skipped due to gas exceeding the configured limit of ${config.GAS_LIMIT}. ` +
          `Fee tiers tried: ${skippedDueToGas.join(", ")}. Try increasing gas limit or lowering input amount.`,
      );
    } else {
      throw new Error("No valid USDC/USDT pool found for this trade.");
    }
  }

  // Slippage Adjusted Mininum Out
  const minAmountOut = (best.amountOut * (10_000n - BigInt(slippageBps))) / 10_000n;
  return {
    ...best,
    slippageAdjustedOut: minAmountOut,
  };
}
