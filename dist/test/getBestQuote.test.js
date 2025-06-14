"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const getBestQuote_1 = require("../src/services/getBestQuote");
const poolFactory = __importStar(require("../src/services/poolFactory"));
const quoter = __importStar(require("../src/services/quoter"));
describe("getBestQuote", () => {
    const addresses = {
        USDC: "0xUSDC",
        USDT: "0xUSDT",
        QUOTER_V2: "0xQUOTER"
    };
    const provider = {};
    afterEach(() => {
        sinon_1.default.restore();
    });
    it("returns best quote among fee tiers", async () => {
        sinon_1.default.stub(poolFactory, 'getPoolWithLiquidity')
            .onFirstCall().resolves({ address: "0xPool1", liquidity: 1000n })
            .onSecondCall().resolves({ address: "0xPool2", liquidity: 1000n })
            .onThirdCall().resolves(null);
        sinon_1.default.stub(quoter, 'getQuoteExactInputSingle')
            .onFirstCall().resolves(9800000n)
            .onSecondCall().resolves(9900000n);
        const result = await (0, getBestQuote_1.getBestQuote)(10000000n, 100, provider, addresses);
        (0, chai_1.expect)(result.amountOut).to.equal(9900000n);
        (0, chai_1.expect)(result.slippageAdjustedAmountOut).to.equal(9801000n);
        (0, chai_1.expect)(result.feeTier).to.equal(500);
    });
    it("throws if no valid pool found", async () => {
        sinon_1.default.stub(poolFactory, 'getPoolWithLiquidity').resolves(null);
        try {
            await (0, getBestQuote_1.getBestQuote)(10000000n, 100, provider, addresses);
            chai_1.expect.fail("Expected to throw");
        }
        catch (err) {
            (0, chai_1.expect)(err.message).to.equal("No valid USDC/USDT pool found");
        }
    });
});
