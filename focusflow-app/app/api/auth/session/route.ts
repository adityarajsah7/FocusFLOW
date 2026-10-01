import { NextResponse } from "next/server";
import { currentUser } from "@/app/auth";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return NextResponse.json({ user: await currentUser(request) }); }
