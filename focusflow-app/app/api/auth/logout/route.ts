import { NextResponse } from "next/server";
import { clearSessionCookie, deleteSession } from "@/app/auth";
export const dynamic = "force-dynamic";
export async function POST(request: Request) { await deleteSession(request); const response = NextResponse.json({ ok: true }); response.headers.set("Set-Cookie", clearSessionCookie); return response; }
