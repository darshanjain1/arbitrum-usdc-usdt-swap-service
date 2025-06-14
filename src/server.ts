import express, { NextFunction, Request, Response } from "express";
import { executeSwap } from "./services/swap";
import { config } from "./config";

const app = express();
app.use(express.json());

// Swap endpoint
app.post("/swap", async (req, res, next) => {
  try {
    const { amountIn } = req.body;

    if (!amountIn || isNaN(Number(amountIn))) {
      //custom error with status code for clarity
      const error = new Error("Invalid amountIn");
      (error as any).status = 400;
      throw error;
    }

    const receipt = await executeSwap(amountIn);
    res.json({ success: true, data: receipt, message: "Swap Executed Successfully", status: 200 });
  } catch (error) {
    next(error); // Forward to error handler
  }
});

// 404 handler (for all other routes)
app.use(() => {
  const error = new Error("Not Found");
  (error as any).status = 404;
  throw error;
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Log the error for debugging
  console.error(err);

  // Use status from error or default to 500
  const status = (err as any).status || (err as any).statusCode || 500;
  const message = err instanceof Error ? err.message : "Server Error";

  res.status(status).json({
    success: false,
    error: message,
    status,
  });
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
