import dotenv from 'dotenv';

dotenv.config();

function requireEnvInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw === undefined || raw === '') return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Config error: environment variable "${key}" must be an integer, got "${raw}"`);
  }
  return parsed;
}

function requireEnvString(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: requireEnvInt('PORT', 3000),
  nodeEnv: requireEnvString('NODE_ENV', 'development'),

  // Pagination — never hardcode these values in route/controller/service logic.
  pagination: {
    defaultLimit: requireEnvInt('PAGINATION_DEFAULT_LIMIT', 20),
    maxLimit: requireEnvInt('PAGINATION_MAX_LIMIT', 100),
  },

  // Rate limiting — configures rateLimiter.ts only, not inline in routes.
  rateLimit: {
    windowMs: requireEnvInt('RATE_LIMIT_WINDOW_MS', 60_000),
    maxRequests: requireEnvInt('RATE_LIMIT_MAX_REQUESTS', 100),
  },
} as const;
