import "dotenv/config";

export const config = {
  RPC_URL: process.env.ARBITRUM_RPC_URL!,
  PRIVATE_KEY: process.env.DEV_WALLET_PRIVATE_KEY!,
  SLIPPAGE_BPS: parseInt(process.env.SLIPPAGE_BPS || "50"),
  GAS_LIMIT: parseInt(process.env.GAS_LIMIT || "1500000"),
  PORT: parseInt(process.env.PORT || "3000"),
  SWAP_ROUTER: "0xe592427a0aece92de3edee1f18e0157c05861564",
  QUOTER_V2: "0x61ffe014ba17989e743c5f6cb21bf9697530b21e",
  USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
};