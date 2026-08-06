import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { getUsers } from "./db";
import type { SessionUser } from "./types";

const COOKIE_NAME = "satria_session";
const SECRET = process.env.SATRIA_SECRET || "satria-dev-secret-change-me";

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encodeSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string): SessionUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function login(username: string, password: string) {
  const users = await getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) return null;

  const session: SessionUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    unit: user.unit,
  };

  const jar = await cookies();
  jar.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return session;
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireSession(roles?: SessionUser["role"][]) {
  const session = await getSession();
  if (!session) return null;
  if (roles && !roles.includes(session.role)) return null;
  return session;
}
