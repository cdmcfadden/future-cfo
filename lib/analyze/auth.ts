import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "analyze_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function expectedToken(): string | null {
  const pw = process.env.ANALYZE_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(pw).digest("hex");
}

export function passwordMatches(submitted: string): boolean {
  const pw = process.env.ANALYZE_PASSWORD;
  if (!pw || !submitted) return false;
  const a = Buffer.from(pw);
  const b = Buffer.from(submitted);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function hasValidAuthCookie(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const store = await cookies();
  const got = store.get(COOKIE_NAME)?.value;
  if (!got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAuthCookie(): Promise<void> {
  const token = expectedToken();
  if (!token) return;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
