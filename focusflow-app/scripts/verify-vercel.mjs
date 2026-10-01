import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";

nextEnv.loadEnvConfig(process.cwd());
const deployment = process.argv[2];
if (!deployment || !process.env.npm_execpath) throw new Error("Run through npm: npm run verify:vercel -- <deployment URL>");
const testEmail = `deployment-test-${randomUUID()}@example.invalid`;
const password = randomUUID();
const temp = mkdtempSync(join(tmpdir(), "focusflow-verify-"));
const jar = join(temp, "cookies.txt");
let userId;
function request(path, method = "GET", body, expected = 200, extra = []) {
  const args = [process.env.npm_execpath, "exec", "--yes", "--package=vercel@62.1.0", "--", "vercel", "curl", path, "--deployment", deployment, "--scope", "sky-d35d", "--", "--silent", "--show-error", "--request", method, "--cookie", jar, "--cookie-jar", jar, "--write-out", "__STATUS__%{http_code}", ...extra];
  if (body !== undefined) args.push("--header", "Content-Type: application/json", "--data", JSON.stringify(body));
  const result = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 60000, maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status) throw new Error(`CLI request failed for ${path}`);
  const output = result.stdout.trim();
  const split = output.lastIndexOf("__STATUS__");
  const status = Number(output.slice(split + "__STATUS__".length));
  if (status !== expected) throw new Error(`${method} ${path}: expected ${expected}, got ${status}`);
  console.log(`PASS ${method} ${path}: ${status}`);
  const content = output.slice(0, split);
  try { return JSON.parse(content); } catch { return content; }
}
try {
  const page = request("/");
  if (!String(page).includes("FocusFlow")) throw new Error("Homepage did not render FocusFlow");
  request("/api/state", "GET", undefined, 401);
  const registration = request("/api/auth/register", "POST", { name: "Deployment test", email: testEmail, password }, 201);
  userId = registration.user.id;
  if (request("/api/auth/session").user?.id !== userId) throw new Error("Session cookie failed");
  const workspace = { tasks: [], notes: [], resources: [], milestones: [], journal: [], name: "Deployment test", goal: { title: "Test", intention: "Verification", target: "2027-03-31" }, scene: { kind: "default", url: "" } };
  request("/api/state", "PUT", workspace);
  if (request("/api/state").data.name !== workspace.name) throw new Error("Saved data did not round-trip");
  request("/api/scene", "POST", undefined, 200, ["--form", "scene=@public/cat-cozy.png;type=image/png"]);
  request("/api/scene");
  request("/api/scene", "DELETE");
  request("/api/auth/logout", "POST");
  if (request("/api/auth/session").user !== null) throw new Error("Logout failed");
  request("/api/auth/login", "POST", { email: testEmail, password });
  console.log("Authentication, persistence, and custom scene flows passed.");
} finally {
  const sql = neon(process.env.DATABASE_URL);
  if (userId) await sql.query("DELETE FROM focusflow_scenes WHERE key = $1", [`focusflow/${userId}/custom-scene`]);
  await sql.query("DELETE FROM focusflow_users WHERE email = $1", [testEmail]);
  rmSync(temp, { recursive: true, force: true });
  console.log("Removed disposable verification account and temporary session files.");
}
