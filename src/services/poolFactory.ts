import { Contract, JsonRpcProvider, ethers } from "ethers";

const POOL_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const FACTORY_ABI = ["function getPool(address,address,uint24) external view returns (address)"];
const POOL_ABI = ["function liquidity() external view returns (uint128)"];

export async function getPoolWithLiquidity(
  provider: JsonRpcProvider,
  tokenIn: string,
  tokenOut: string,
  fee: number,
): Promise<{ address: string; liquidity: bigint } | null> {
  const factory = new Contract(POOL_FACTORY, FACTORY_ABI, provider);
  const poolAddress = await factory.getPool(tokenIn, tokenOut, fee);
  if (!poolAddress || poolAddress === ethers.ZeroAddress) return null;

  const pool = new Contract(poolAddress, POOL_ABI, provider);
  const liquidity = await pool.liquidity();
  if (liquidity === 0n) return null;

  return { address: poolAddress, liquidity };
}
