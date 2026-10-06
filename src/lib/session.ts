import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Secrets, compared and derived in one place. No Next.js imports, so the
 * edge of every route (visitor tagging, cron, admin) can share it.
 */

export const ADMIN_COOKIE = "div1_admin";
export const SESSION_TTL_SEC = 7 * 24 * 60 * 60;

/** Constant-time string equality — never `===` on a secret. */
export function sameSecret(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  // Hash first so unequal lengths don't short-circuit (and leak the length).
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

/** Does `Authorization: Bearer …` carry one of these secrets? */
export function bearerIs(header: string | null, ...secrets: (string | undefined)[]): boolean {
  const got = header?.startsWith("Bearer ") ? header.slice(7) : null;
  return secrets.some((s) => !!s && sameSecret(got, s));
}

const sign = (token: string, exp: number) => createHmac("sha256", token).update(`div1-admin:${exp}`).digest("hex");

/**
 * Admin session cookie: `<expiry>.<HMAC(ADMIN_TOKEN, expiry)>`. Each login
 * mints a fresh value that dies on its own; rotating ADMIN_TOKEN revokes
 * every session at once. The token itself never leaves the server.
 */
export function mintSession(token: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + SESSION_TTL_SEC;
  return `${exp}.${sign(token, exp)}`;
}

export function validSession(value: string | null | undefined, token: string | undefined, now = Date.now()): boolean {
  if (!value || !token) return false;
  const [expRaw, mac] = value.split(".");
  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp * 1000 <= now || !mac) return false;
  return sameSecret(mac, sign(token, exp));
}

/**
 * Salt for visitor hashes. IP_SALT when set; otherwise derived from
 * ADMIN_TOKEN (a server secret), so the salt is never the public default
 * that would let a leaked hash be brute-forced back to an IPv4 address.
 */
export function visitorSalt(): string {
  if (process.env.IP_SALT) return process.env.IP_SALT;
  const token = process.env.ADMIN_TOKEN;
  return token ? createHmac("sha256", token).update("div1-visitor-salt").digest("hex") : "div1-dev";
}
