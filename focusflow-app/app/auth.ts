import { env } from "cloudflare:workers";

const SESSION_COOKIE = "focusflow_session";
const SESSION_DAYS = 30;

function database() {
  if (!env.DB) throw new Error("FocusFlow storage is unavailable");
  return env.DB;
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function sha256(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export async function hashPassword(password: string, salt = randomHex(16)) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 210_000 }, key, 256);
  return { salt, hash: bytesToHex(new Uint8Array(bits)) };
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const { hash } = await hashPassword(password, salt);
  if (hash.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < hash.length; index += 1) difference |= hash.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}

export type FocusFlowUser = { id: string; email: string; name: string };

export async function currentUser(request: Request): Promise<FocusFlowUser | null> {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  return database().prepare(`SELECT users.id, users.email, users.name FROM focusflow_sessions sessions JOIN focusflow_users users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?`).bind(tokenHash, now).first<FocusFlowUser>();
}

export async function createSession(userId: string) {
  const token = randomHex(32);
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await database().prepare("INSERT INTO focusflow_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").bind(tokenHash, userId, expires.toISOString(), new Date().toISOString()).run();
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86_400}`;
}

export async function deleteSession(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (token) await database().prepare("DELETE FROM focusflow_sessions WHERE token_hash = ?").bind(await sha256(token)).run();
}

export const clearSessionCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export { database };
