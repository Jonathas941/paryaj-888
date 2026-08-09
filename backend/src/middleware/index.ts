import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import jwt from "jsonwebtoken";
import { AppError, badRequest, forbidden, unauthorized } from "../utils/errors";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
      requestId?: string;
    }
  }
}

/** Tags each request so a log line can be traced to a client report. */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id =
    (req.headers["x-request-id"] as string) ||
    `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}

/** Rejects unless a valid access token is present. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(unauthorized());
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, "TOKEN_EXPIRED", "Your session has expired. Please sign in again."));
    }
    next(unauthorized("Invalid authentication token."));
  }
}

/** Attaches req.user when a token is present, but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      /* ignore — treated as anonymous */
    }
  }
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== "ADMIN") return next(forbidden("Administrator access required."));
  next();
}

/** Validates and replaces req.body from a Zod schema. */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        badRequest(
          "Some of the details you entered are not valid.",
          parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))
        )
      );
    }
    req.body = parsed.data;
    next();
  };
}

/**
 * Fixed-window in-memory limiter. Adequate for a single instance; move to
 * Redis before scaling past one replica, since each replica keeps its own
 * counters.
 */
export function rateLimit(opts: { windowMs: number; max: number; key?: (req: Request) => string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.key ? opts.key(req) : req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }
    if (entry.count >= opts.max) {
      res.setHeader("retry-after", Math.ceil((entry.resetAt - now) / 1000));
      return next(new AppError(429, "RATE_LIMITED", "Too many requests. Please slow down."));
    }
    entry.count++;
    next();
  };
}

/** Terminal error handler. Must be registered last. */
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof AppError ? err.status : 500;
  const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";
  const message =
    err instanceof AppError ? err.message : "Something went wrong on our end. Please try again.";

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.path} [${req.requestId}]`, err);
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(err instanceof AppError && err.details ? { details: err.details } : {}),
      requestId: req.requestId
    }
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}`, requestId: req.requestId }
  });
}
