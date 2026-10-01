import { env } from "@/lib/runtime-env";
import { NextResponse } from "next/server";
import { currentUser } from "@/app/auth";

export const dynamic = "force-dynamic";

function bucket() {
  if (!env.BUCKET) throw new Error("Scene storage is unavailable");
  return env.BUCKET;
}

export async function GET(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const object = await bucket().get(`focusflow/${user.id}/custom-scene`);
    if (!object) return new NextResponse(null, { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "private, no-store");
    headers.set("x-content-type-options", "nosniff");
    return new NextResponse(object.body, { headers });
  } catch (error) {
    console.error("Unable to load custom scene", error);
    return NextResponse.json({ error: "Custom scene unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const data = await request.formData();
    const file = data.get("scene");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image or video." }, { status: 400 });
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"].includes(file.type)) return NextResponse.json({ error: "Choose a JPG, PNG, WebP, GIF, MP4, or WebM file." }, { status: 415 });
    const maxMB = process.env.VERCEL ? 4 : 60;
    if (file.size > maxMB * 1024 * 1024) return NextResponse.json({ error: `Choose a file smaller than ${maxMB} MB.` }, { status: 413 });
    await bucket().put(`focusflow/${user.id}/custom-scene`, file.stream(), { httpMetadata: { contentType: file.type } });
    return NextResponse.json({ kind: file.type.startsWith("video/") ? "video" : "image", url: `/api/scene?v=${Date.now()}` });
  } catch (error) {
    console.error("Unable to save custom scene", error);
    return NextResponse.json({ error: "The scene could not be saved." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  try { const user = await currentUser(request); if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 }); await bucket().delete(`focusflow/${user.id}/custom-scene`); return NextResponse.json({ ok: true }); }
  catch (error) { console.error("Unable to reset custom scene", error); return NextResponse.json({ error: "The scene could not be reset." }, { status: 503 }); }
}
