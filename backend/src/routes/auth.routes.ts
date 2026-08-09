import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { transaction, one } from "../db/pool";
import { validateBody, requireAuth, rateLimit } from "../middleware";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { conflict, unauthorized, notFound, forbidden } from "../utils/errors";
import { ensureWallet } from "../services/wallet.service";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only."),
  password: z.string().min(8, "Use at least 8 characters."),
  dateOfBirth: z.string().optional(),
  country: z.string().max(80).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function publicUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    status: u.status,
    country: u.country,
    created_at: u.created_at
  };
}

// Brute-force protection on the credential endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

authRouter.post("/register", authLimiter, validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, username, password, dateOfBirth, country } = req.body;

    // Legal-age gate. Regulatory minimums vary by market; 18 is the floor.
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (Number.isFinite(age) && age < 18) {
        return next(forbidden("You must be at least 18 years old to open an account."));
      }
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await transaction(async client => {
      const dup = await client.query("SELECT 1 FROM users WHERE email = $1 OR username = $2", [
        email.toLowerCase(),
        username
      ]);
      if (dup.rows.length) throw conflict("An account with those details already exists.");

      const { rows } = await client.query(
        `INSERT INTO users (email, username, password_hash, date_of_birth, country)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [email.toLowerCase(), username, hash, dateOfBirth || null, country || null]
      );
      const user = rows[0];
      await ensureWallet(client, user.id);
      return user;
    });

    const payload = { sub: result.id, email: result.email, role: result.role };
    res.status(201).json({
      user: publicUser(result),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", authLimiter, validateBody(loginSchema), async (req, res, next) => {
  try {
    const user = await one("SELECT * FROM users WHERE email = $1", [req.body.email.toLowerCase()]);

    // Compare against a dummy hash when the user is missing so response time
    // does not reveal whether the email is registered.
    const hash = user?.password_hash || "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
    const ok = await bcrypt.compare(req.body.password, hash);

    if (!user || !ok) return next(unauthorized("Incorrect email or password."));
    if (user.status !== "ACTIVE") return next(forbidden("This account is not active."));

    const payload = { sub: user.id, email: user.email, role: user.role };
    res.json({
      user: publicUser(user),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const token = req.body?.refreshToken;
    if (!token) return next(unauthorized("A refresh token is required."));
    const decoded = verifyRefreshToken(token);
    const user = await one("SELECT * FROM users WHERE id = $1", [decoded.sub]);
    if (!user || user.status !== "ACTIVE") return next(unauthorized("This session is no longer valid."));

    const payload = { sub: user.id, email: user.email, role: user.role };
    res.json({ accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) });
  } catch {
    next(unauthorized("This session is no longer valid."));
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await one("SELECT * FROM users WHERE id = $1", [req.user!.sub]);
    if (!user) return next(notFound("Account not found."));
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

const patchSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  country: z.string().max(80).optional()
});

authRouter.patch("/me", requireAuth, validateBody(patchSchema), async (req, res, next) => {
  try {
    const user = await one(
      `UPDATE users
          SET username = COALESCE($2, username),
              country  = COALESCE($3, country),
              updated_at = now()
        WHERE id = $1 RETURNING *`,
      [req.user!.sub, req.body.username ?? null, req.body.country ?? null]
    );
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});
