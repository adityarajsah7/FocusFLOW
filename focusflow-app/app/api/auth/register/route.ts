import { NextResponse } from "next/server";
import { createSession, database, hashPassword } from "@/app/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; email?: string; password?: string };
    if (!body || typeof body.name !== "string" || typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.name.length > 50) {
      return NextResponse.json({ error: "Enter a valid name, email, and password." }, { status: 400 });
    }
    const name = body.name?.trim().slice(0, 50) ?? "";
    const email = body.email?.trim().toLowerCase().slice(0, 254) ?? "";
    const password = body.password ?? "";
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter your name and a valid email." }, { status: 400 });
    if (password.length < 8 || password.length > 128) return NextResponse.json({ error: "Use at least 8 characters for your password." }, { status: 400 });
    const existing = await database().prepare("SELECT id FROM focusflow_users WHERE email = ?").bind(email).first();
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const id = crypto.randomUUID();
    const { salt, hash } = await hashPassword(password);
    await database().prepare("INSERT INTO focusflow_users (id, email, name, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(id, email, name, hash, salt, new Date().toISOString()).run();
    const workspace = { tasks: [], notes: [], resources: [], milestones: [], journal: [], goal: { title: "", target: "", intention: "" }, name, scene: { kind: "default", url: "" } };
    await database().prepare("INSERT INTO focusflow_user_state (user_id, payload, updated_at) VALUES (?, ?, ?)").bind(id, JSON.stringify(workspace), new Date().toISOString()).run();
    const response = NextResponse.json({ user: { id, email, name } }, { status: 201 });
    response.headers.set("Set-Cookie", await createSession(id));
    return response;
  } catch (error) {
    console.error("Unable to create FocusFlow account", error);
    return NextResponse.json({ error: "Your account could not be created." }, { status: 503 });
  }
}
