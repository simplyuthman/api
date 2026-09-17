import rateLimit from "express-rate-limit";
import { config } from "../config/config";
import { buildError } from "../utils/envelope";

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    const retryAfter = Math.ceil(config.rateLimit.windowMs / 1000);
    res.setHeader("Retry-After", retryAfter);
    res.status(429).json(
      buildError("RATE_LIMIT_EXCEEDED", "Too many requests, please try again later.")
    );
  },
});
