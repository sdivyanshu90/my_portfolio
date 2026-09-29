import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { getStore } from "@/lib/store";
import { overLimit, visitorId } from "@/lib/visitor";

/**
 * /admin access. Log in once with ADMIN_TOKEN; the browser then holds an
 * HttpOnly, SameSite=Strict cookie containing a *hash* of the token (never the
 * token itself). No ADMIN_TOKEN configured → there is no admin at all.
 */

export const ADMIN_COOKIE = "div1_admin";
const WEEK = 7 * 24 * 60 * 60;

const hash = (s: string) => createHash("sha256").update(`div1-admin:${s}`).digest("hex");

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function isAdmin(): Promise<boolean> {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const got = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!got && same(got, hash(token));
}

export type LoginResult = "ok" | "wrong" | "throttled" | "disabled";

export async function logIn(candidate: string): Promise<LoginResult> {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return "disabled";
  const visitor = await visitorId({ headers: await headers() });
  if (await overLimit(getStore(), "admin-login", visitor, 5)) return "throttled";
  if (!same(hash(candidate), hash(token))) return "wrong";
  (await cookies()).set(ADMIN_COOKIE, hash(token), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && !process.env.ADMIN_INSECURE_COOKIE,
    path: "/",
    maxAge: WEEK,
  });
  return "ok";
}

export async function logOut(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
