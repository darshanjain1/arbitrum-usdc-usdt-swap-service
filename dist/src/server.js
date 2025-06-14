"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swap_1 = require("./services/swap");
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Swap endpoint
app.post('/swap', async (req, res, next) => {
    try {
        const { amountIn } = req.body;
        if (!amountIn || isNaN(Number(amountIn))) {
            //custom error with status code for clarity
            const error = new Error('Invalid amountIn');
            error.status = 400;
            throw error;
        }
        const receipt = await (0, swap_1.executeSwap)(amountIn);
        res.json({ success: true, data: receipt, message: "Swap Executed Successfully", status: 200 });
    }
    catch (error) {
        next(error); // Forward to error handler
    }
});
// 404 handler (for all other routes)
app.use(() => {
    const error = new Error('Not Found');
    error.status = 404;
    throw error;
});
// Centralized error handler
app.use((err, _req, res, _next) => {
    // Log the error for debugging
    console.error(err);
    // Use status from error or default to 500
    const status = err.status || err.statusCode || 500;
    const message = err instanceof Error ? err.message : 'Server Error';
    res.status(status).json({
        success: false,
        error: message,
        status
    });
});
app.listen(config_1.config.PORT, () => {
    console.log(`Server running on port ${config_1.config.PORT}`);
});
