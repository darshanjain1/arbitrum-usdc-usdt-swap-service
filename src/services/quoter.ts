import { Contract, JsonRpcProvider } from "ethers";

const QUOTER_ABI = [
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
];

export async function getQuoteExactInputSingle(
  provider: JsonRpcProvider,
  quoterAddress: string,
  params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    fee: number;
  },
): Promise<{ amountOut: bigint; gasEstimate: bigint }> {
  const quoter = new Contract(quoterAddress, QUOTER_ABI, provider);
  const [amountOut, , , gasEstimate] = await quoter.quoteExactInputSingle.staticCall({
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    amountIn: params.amountIn,
    fee: params.fee,
    sqrtPriceLimitX96: 0n,
  });

  return { amountOut, gasEstimate };
}
