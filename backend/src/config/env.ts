import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() ? v : fallback;
}

const isProd = optional("NODE_ENV", "development") === "production";

// Secrets must be explicitly set in production. Falling back to a default
// JWT secret in prod would let anyone mint a valid admin token.
function secret(name: string, devFallback: string): string {
  if (isProd) return required(name);
  return optional(name, devFallback);
}

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  isProd,
  // Railway injects PORT. Never hardcode it.
  port: parseInt(optional("PORT", "3000"), 10),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: secret("JWT_SECRET", "dev-only-insecure-jwt-secret"),
  jwtRefreshSecret: secret("JWT_REFRESH_SECRET", "dev-only-insecure-refresh-secret"),
  accessTokenTtl: optional("ACCESS_TOKEN_TTL", "2h"),
  refreshTokenTtl: optional("REFRESH_TOKEN_TTL", "30d"),
  // Comma-separated list of allowed browser origins.
  frontendOrigins: optional("FRONTEND_ORIGIN", "*")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
  logLevel: optional("LOG_LEVEL", "info"),
  // Risk limits
  minStake: parseFloat(optional("MIN_STAKE", "0.50")),
  maxStake: parseFloat(optional("MAX_STAKE", "5000")),
  maxPayout: parseFloat(optional("MAX_PAYOUT", "100000")),
  maxSelectionsPerBet: parseInt(optional("MAX_SELECTIONS_PER_BET", "20"), 10)
};
