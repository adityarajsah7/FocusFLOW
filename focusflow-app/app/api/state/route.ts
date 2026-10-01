import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { currentUser } from "@/app/auth";

export const dynamic = "force-dynamic";

function database() {
  if (!env.DB) throw new Error("FocusFlow storage is unavailable");
  return env.DB;
}

export async function GET(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const row = await database()
      .prepare("SELECT payload, updated_at FROM focusflow_user_state WHERE user_id = ?")
      .bind(user.id)
      .first<{ payload: string; updated_at: string }>();
    return NextResponse.json(row ? { data: JSON.parse(row.payload), updatedAt: row.updated_at } : { data: null });
  } catch (error) {
    console.error("Unable to load FocusFlow state", error);
    return NextResponse.json({ error: "Your workspace could not be loaded." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const data = await request.json();
    const payload = JSON.stringify(data);
    if (payload.length > 500_000) return NextResponse.json({ error: "Workspace is too large." }, { status: 413 });
    const updatedAt = new Date().toISOString();
    await database().prepare(`
      INSERT INTO focusflow_user_state (user_id, payload, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
    `).bind(user.id, payload, updatedAt).run();
    return NextResponse.json({ ok: true, updatedAt });
  } catch (error) {
    console.error("Unable to save FocusFlow state", error);
    return NextResponse.json({ error: "Your changes could not be saved." }, { status: 503 });
  }
}
