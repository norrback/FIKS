import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "fiks_session";

function getSecretKey() {
  const s =
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "fiks-dev-jwt-secret-key-min-32-chars!!"
      : "");
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET must be set to a string of at least 32 characters");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(userId: string, email: string) {
  return new SignJWT({ email })
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(getSecretKey());
}

export type SessionUser = { userId: string; email: string };

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = payload.sub;
    const email = payload.email;
    if (typeof userId !== "string" || typeof email !== "string") return null;
    return { userId, email };
  } catch {
    return null;
  }
}
