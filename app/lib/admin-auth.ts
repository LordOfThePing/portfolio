import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session handling for the stats dashboard and the config editor.
 *
 * Credentials live in the ADMIN_USER / ADMIN_PASSWORD env vars and never reach
 * the browser. On success we hand out an HMAC-signed cookie so you stay logged
 * in on your phone; the cookie proves "someone knew the credentials" and
 * nothing else.
 *
 * The signing key is derived from both values, so changing either one
 * automatically invalidates every existing session.
 */

export const ADMIN_COOKIE = "pf_admin";
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

const username = () => process.env.ADMIN_USER ?? "";
const password = () => process.env.ADMIN_PASSWORD ?? "";

/** Both vars required: a half-configured admin stays closed, never wide open. */
export const isConfigured = () => username().length > 0 && password().length > 0;

/** Names the vars still missing, for the login screen to show. */
export function missingEnvVars(): string[] {
  const missing: string[] = [];
  if (!username()) missing.push("ADMIN_USER");
  if (!password()) missing.push("ADMIN_PASSWORD");
  return missing;
}

function signingKey(): Buffer {
  return crypto
    .createHash("sha256")
    .update(`${process.env.ADMIN_SECRET ?? ""}:${username()}:${password()}`)
    .digest();
}

/** Compares digests rather than raw input, so length never leaks and the compare is constant-time. */
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * Both comparisons are evaluated before they're combined, so a wrong username
 * costs the same as a wrong password and timing can't reveal which half was
 * right. The login screen reports one generic error for the same reason.
 */
export function verifyCredentials(user: string, pass: string): boolean {
  if (!isConfigured()) return false;
  const userOk = safeEqual(user, username());
  const passOk = safeEqual(pass, password());
  return userOk && passOk;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", signingKey()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MS;
  return `${expiresAt}.${sign(String(expiresAt))}`;
}

function isValidToken(token: string | undefined): boolean {
  if (!token || !isConfigured()) return false;

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, sign(expiresAt))) return false;

  return Date.now() < Number(expiresAt);
}

/** True when the current request carries a valid admin session. */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return isValidToken(jar.get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
} as const;

/**
 * Best-effort brute-force throttle. Serverless instances are short-lived so
 * this isn't airtight, but it makes online guessing impractical and costs
 * nothing. Use a long random password and this is belt-and-braces.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

export function rateLimit(ip: string): { allowed: boolean; retryInMin: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryInMin: 0 };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryInMin: Math.ceil((entry.resetAt - now) / 60000) };
  }
  return { allowed: true, retryInMin: 0 };
}

export function clearRateLimit(ip: string): void {
  attempts.delete(ip);
}
