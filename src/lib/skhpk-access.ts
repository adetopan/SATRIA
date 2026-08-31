import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { normalizeNrp } from "@/lib/format";

const COOKIE_NAME = "satria_skhpk_access";
const SECRET = process.env.SATRIA_SECRET || "satria-dev-secret-change-me";

function sign(payload: string) {
  return createHmac("sha256", SECRET)
    .update(`skhpk-access:${payload}`)
    .digest("base64url");
}

function encode(ids: string[]) {
  const payload = Buffer.from(JSON.stringify(ids)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): string[] | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const ids = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Array.isArray(ids) ? ids.map(String) : null;
  } catch {
    return null;
  }
}

export function nrpMatches(input: string, actual: string) {
  const a = Buffer.from(normalizeNrp(input));
  const b = Buffer.from(normalizeNrp(actual));
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function getUnlockedSkhpkIds() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return [] as string[];
  return decode(token) || [];
}

export async function hasSkhpkAccess(rikkesId: string) {
  const ids = await getUnlockedSkhpkIds();
  return ids.includes(rikkesId);
}

export async function grantSkhpkAccess(rikkesId: string) {
  const ids = await getUnlockedSkhpkIds();
  if (!ids.includes(rikkesId)) ids.push(rikkesId);
  const jar = await cookies();
  jar.set(COOKIE_NAME, encode(ids), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}
