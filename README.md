# USDC → USDT Swap Microservice (Arbitrum, Uniswap v3)

## Objective

A Node.js/TypeScript backend that programmatically swaps USDC for USDT on Arbitrum One, using Uniswap v3.

- Quotes the expected output with slippage protection
- Builds, signs, and broadcasts the swap transaction
- Waits for confirmation and returns a concise JSON receipt

## Requirements

- Node.js ≥ 20 LTS
- Ethers v6, Hardhat, TypeScript
- Arbitrum One (chainId 42161)
- SwapRouter: `0xE592427A0AEce92De3Edee1F18E0157C05861564`
- QuoterV2: `0x61fFE014bA17989E743c5F6cB21bF9697530B21e`
- USDC: `0xaf88D065E77c8cC2239327C5EDb3A432268e5831`
- USDT: `0xFd086Bc7cD5c481dCc9C85ebe478A1C0b69FCBb9`

## Setup

1. **Clone the repo and install dependencies:**

- git clone <your-repo-url>
- cd usdc-usdt-swap
- npm install

2. **Configure environment variables:**

- cp .env.example .env

3. **Fund your dev wallet:**

- Get testnet ETH from [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
- Swap for testnet USDC/USDT on a testnet DEX or use a faucet

## Usage

### REST API

**POST /swap**

Request: { "amountIn": "10.00" }

Response: {
"blockNumber": 123456,
"gasUsed": "123456",
"usdcIn": "10.00",
"usdtOut": "9.99",
"effectivePrice": 1.001
}

**Example:**

curl -X POST http://localhost:3000/swap
-H "Content-Type: application/json"
-d '{"amountIn": "1.00"}'

### Scripts & Tests

**Run the server:**
npm run start

**Run tests:**
npm run test
