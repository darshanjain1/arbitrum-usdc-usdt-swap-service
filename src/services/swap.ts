import { Contract, ethers } from "ethers";
import { config, wallet, provider } from "../config";
import { getBestQuote } from "./getBestQuote";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];
const SWAP_ROUTER_ABI = [
  `function exactInputSingle((
    address tokenIn,
    address tokenOut,
    uint24 fee,
    address recipient,
    uint256 deadline,
    uint256 amountIn,
    uint256 amountOutMinimum,
    uint160 sqrtPriceLimitX96
  )) external payable returns (uint256 amountOut)`,
];

export async function executeSwap(amountIn: string) {
  // 1. Get quote
  const amountInWei = ethers.parseUnits(amountIn, 6);
  const quote = await getBestQuote(amountInWei, config.SLIPPAGE_BPS, provider, {
    QUOTER_V2: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
    USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  });

  // 2. Approve if needed
  const usdc = new Contract(config.USDC, ERC20_ABI, wallet);
  const allowance = await usdc.allowance(wallet.address, config.SWAP_ROUTER);
  if (allowance < amountInWei) {
    const approveTx = await usdc.approve(config.SWAP_ROUTER, amountInWei);
    await approveTx.wait(1);
  }

  // 3. Prepare swap params
  const swapRouter = new Contract(config.SWAP_ROUTER, SWAP_ROUTER_ABI, wallet);
  const params = {
    tokenIn: config.USDC,
    tokenOut: config.USDT,
    fee: quote.feeTier,
    recipient: wallet.address,
    amountIn: amountInWei,
    amountOutMinimum: quote.slippageAdjustedAmountOut,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    sqrtPriceLimitX96: 0n,
  };

  // 4. Estimate gas
  let expectedGasUsage: bigint;
  try {
    expectedGasUsage = await swapRouter.exactInputSingle.estimateGas(params);
    if (expectedGasUsage > BigInt(config.GAS_LIMIT)) {
      throw new Error("Estimated gas exceeds allowed limit");
    }
  } catch (e) {
    throw new Error("Gas estimation failed: " + (e as Error).message);
  }

  // 5. Nonce handling with retry
  let tx,
    receipt,
    attempts = 0;
  let nonce = await wallet.getNonce("pending");

  while (attempts < 3) {
    try {
      tx = await swapRouter.exactInputSingle(params, { nonce, expectedGasUsage });
      console.log("Transaction Hash for attempt no.", attempts, "is", tx.hash);
      receipt = await tx.wait(2);
      break;
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("nonce too low")) {
        attempts += 1;
        nonce += 1;
        continue;
      }
      throw err;
    }
  }
  if (!receipt) throw new Error("Transaction failed after retries");

  // 6. Parse receipt
  return {
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    usdcIn: amountIn,
    usdtOut: ethers.formatUnits(receipt.logs[0]?.data || "0", 6),
    effectivePrice: Number(amountIn) / Number(ethers.formatUnits(receipt.logs[0]?.data || "0", 6)),
  };
}
