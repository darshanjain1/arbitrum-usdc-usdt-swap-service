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
      .resolves(9800000n)
      .onSecondCall()
      .resolves(9900000n);

    const result = await getBestQuote(10_000_000n, 100, provider, addresses);

    expect(result.amountOut).to.equal(9900000n);
    expect(result.slippageAdjustedAmountOut).to.equal(9801000n);
    expect(result.feeTier).to.equal(500);
  });

  it("throws if no valid pool found", async () => {
    sinon.stub(poolFactory, "getPoolWithLiquidity").resolves(null);

    try {
      await getBestQuote(10_000_000n, 100, provider, addresses);
      expect.fail("Expected to throw");
    } catch (err: any) {
      expect(err.message).to.equal("No valid USDC/USDT pool found");
    }
  });
});
