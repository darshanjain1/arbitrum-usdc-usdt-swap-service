import { expect } from "chai";
import sinon from "sinon";
import { getBestQuote } from "../src/services/getBestQuote";
import * as poolFactory from "../src/services/poolFactory";
import * as quoter from "../src/services/quoter";
import { JsonRpcProvider } from "ethers";

describe("getBestQuote", () => {
  const addresses = {
    USDC: "0xUSDC",
    USDT: "0xUSDT",
    QUOTER_V2: "0xQUOTER",
  };

  const provider = {} as JsonRpcProvider;

  afterEach(() => {
    sinon.restore();
  });

  it("returns best quote among fee tiers", async () => {
    sinon
      .stub(poolFactory, "getPoolWithLiquidity")
      .onFirstCall()
      .resolves({ address: "0xPool1", liquidity: 1000n })
      .onSecondCall()
      .resolves({ address: "0xPool2", liquidity: 1000n })
      .onThirdCall()
      .resolves(null);

    sinon
      .stub(quoter, "getQuoteExactInputSingle")
      .onFirstCall()
      .resolves({ amountOut: 9800000n, gasEstimate: 100000n })
      .onSecondCall()
      .resolves({ amountOut: 9900000n, gasEstimate: 100000n });

    const result = await getBestQuote(10_000_000n, 100, provider, addresses);

    expect(result.amountOut).to.equal(9900000n);
    expect(result.slippageAdjustedOut).to.equal(9801000n); // 9900000 * 0.99
    expect(result.feeTier).to.equal(500);
  });

  it("skips high gas estimate pools and throws if all skipped", async () => {
    sinon
      .stub(poolFactory, "getPoolWithLiquidity")
      .resolves({ address: "0xPool", liquidity: 1000n });

    sinon
      .stub(quoter, "getQuoteExactInputSingle")
      .resolves({ amountOut: 1000000n, gasEstimate: 20_000_000n }); // Too high gas

    try {
      await getBestQuote(10_000_000n, 100, provider, addresses);
      expect.fail("Expected to throw");
    } catch (err: any) {
      expect(err.message).to.include("All available pools were skipped due to gas exceeding");
    }
  });

  it("skips high gas pools but returns best from valid ones", async () => {
    sinon
      .stub(poolFactory, "getPoolWithLiquidity")
      .onFirstCall()
      .resolves({ address: "0xPool1", liquidity: 1000n }) // high gas
      .onSecondCall()
      .resolves({ address: "0xPool2", liquidity: 1000n }); // valid
    sinon
      .stub(quoter, "getQuoteExactInputSingle")
      .onFirstCall()
      .resolves({ amountOut: 9999999n, gasEstimate: 20_000_000n }) // too high
      .onSecondCall()
      .resolves({ amountOut: 9900000n, gasEstimate: 100000n });

    const result = await getBestQuote(10_000_000n, 100, provider, addresses);

    expect(result.amountOut).to.equal(9900000n);
  });

  it("throws if no pool has liquidity", async () => {
    sinon.stub(poolFactory, "getPoolWithLiquidity").resolves(null);

    try {
      await getBestQuote(10_000_000n, 100, provider, addresses);
      expect.fail("Expected to throw");
    } catch (err: any) {
      expect(err.message).to.equal("No valid USDC/USDT pool found for this trade.");
    }
  });
});
