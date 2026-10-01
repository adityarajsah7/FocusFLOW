import { NextResponse } from "next/server";
import { createSession, database, verifyPassword } from "@/app/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    if (!body || typeof body.email !== "string" || typeof body.password !== "string" || body.email.length > 254 || body.password.length > 128 || body.password.length < 8) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();
    const user = await database().prepare("SELECT id, email, name, password_hash, password_salt FROM focusflow_users WHERE email = ?").bind(email).first<{ id: string; email: string; name: string; password_hash: string; password_salt: string }>();
    if (!user) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    if (!(await verifyPassword(body.password ?? "", user.password_salt, user.password_hash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    response.headers.set("Set-Cookie", await createSession(user.id));
    return response;
  } catch (error) {
    console.error("Unable to sign in to FocusFlow", error);
    return NextResponse.json({ error: "Sign in is temporarily unavailable." }, { status: 503 });
  }
}
