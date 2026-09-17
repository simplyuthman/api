import rateLimit from 'express-rate-limit';
import { config } from '../config/config';
import { buildError } from '../utils/envelope';

/**
 * Rate limiter applied globally to all routes.
 * Values come from config (env vars), never hardcoded here.
 * Returns 429 with Retry-After header when the limit is exceeded. (PRD §5.4, §6)
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,  // sets RateLimit-* headers
  legacyHeaders: false,
  // Retry-After value in seconds: window duration
  message: buildError('RATE_LIMIT_EXCEEDED', 'Too many requests, please try again later.'),
  handler: (_req, res, _next, options) => {
    const retryAfterSeconds = Math.ceil(config.rateLimit.windowMs / 1000);
    res
      .status(429)
      .set('Retry-After', String(retryAfterSeconds))
      .json(options.message);
  },
});
