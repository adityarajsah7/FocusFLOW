import { NextResponse } from "next/server";
import { currentUser } from "@/app/auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    return NextResponse.json({ user: await currentUser(request) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load session", error);
    return NextResponse.json({ error: "Sign in is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
