import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("Connect Neon before running migrations.");
const sql = neon(process.env.DATABASE_URL);
const statements = [
  `CREATE TABLE IF NOT EXISTS focusflow_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS focusflow_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES focusflow_users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS focusflow_sessions_user_idx ON focusflow_sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS focusflow_user_state (user_id TEXT PRIMARY KEY REFERENCES focusflow_users(id) ON DELETE CASCADE, payload TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS focusflow_scenes (key TEXT PRIMARY KEY, content TEXT NOT NULL, content_type TEXT NOT NULL)`,
];
await sql.transaction(statements.map((query) => sql.query(query)));
console.log("FocusFlow schema is ready.");
