"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolWithLiquidity = getPoolWithLiquidity;
const ethers_1 = require("ethers");
const POOL_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
const FACTORY_ABI = [
    'function getPool(address,address,uint24) external view returns (address)'
];
const POOL_ABI = [
    'function liquidity() external view returns (uint128)'
];
async function getPoolWithLiquidity(provider, tokenIn, tokenOut, fee) {
    const factory = new ethers_1.Contract(POOL_FACTORY, FACTORY_ABI, provider);
    const poolAddress = await factory.getPool(tokenIn, tokenOut, fee);
    if (!poolAddress || poolAddress === ethers_1.ethers.ZeroAddress)
        return null;
    const pool = new ethers_1.Contract(poolAddress, POOL_ABI, provider);
    const liquidity = await pool.liquidity();
    if (liquidity === 0n)
        return null;
    return { address: poolAddress, liquidity };
}
