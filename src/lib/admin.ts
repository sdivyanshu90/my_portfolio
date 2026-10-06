import { cookies, headers } from "next/headers";
import { ADMIN_COOKIE, SESSION_TTL_SEC, mintSession, sameSecret, validSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { overLimit, visitorId } from "@/lib/visitor";

/**
 * /admin access. Log in once with ADMIN_TOKEN; the browser then holds an
 * HttpOnly, SameSite=Strict session cookie — an expiring HMAC, never the
 * token itself (lib/session). No ADMIN_TOKEN configured → no admin at all.
 */

export { ADMIN_COOKIE };

/** Wrong guesses per hour across every visitor — rotating IPs don't reset it. */
const FAILED_LOGINS_PER_HOUR = 20;

export async function isAdmin(): Promise<boolean> {
  return validSession((await cookies()).get(ADMIN_COOKIE)?.value, process.env.ADMIN_TOKEN);
}

export type LoginResult = "ok" | "wrong" | "throttled" | "disabled";

export async function logIn(candidate: string): Promise<LoginResult> {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return "disabled";
  const visitor = await visitorId({ headers: await headers() });
  const store = getStore();
  if (await overLimit(store, "admin-login", visitor, 5)) return "throttled";
  const hour = Math.floor(Date.now() / 3_600_000);
  const failures = `div1:rl:admin-fail:${hour}`;
  if (Number(await store.get(failures)) >= FAILED_LOGINS_PER_HOUR) return "throttled";
  if (!sameSecret(candidate, token)) {
    await store.incr(failures, 3_700);
    return "wrong";
  }
  (await cookies()).set(ADMIN_COOKIE, mintSession(token), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && !process.env.ADMIN_INSECURE_COOKIE,
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  return "ok";
}

export async function logOut(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
