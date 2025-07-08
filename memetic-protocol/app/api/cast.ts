import { NextRequest, NextResponse } from "next/server";

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
const WARPCAST_FID = process.env.WARPCAST_FID; // The FID of the caster (must be set up)
const WARPCAST_SIGNER_UUID = process.env.WARPCAST_SIGNER_UUID; // The signer UUID for the caster

// Helper to upload image to Imgur (anonymous)
async function uploadToImgur(dataUrl: string): Promise<string> {
  const base64 = dataUrl.split(",")[1];
  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: base64, type: "base64" }),
  });
  const json = await res.json();
  if (!res.ok || !json.data?.link) throw new Error("Failed to upload image to Imgur");
  return json.data.link;
}

export async function POST(req: NextRequest) {
  if (!NEYNAR_API_KEY || !WARPCAST_FID || !WARPCAST_SIGNER_UUID || !process.env.IMGUR_CLIENT_ID) {
    return NextResponse.json({ error: "Missing API keys or config" }, { status: 500 });
  }
  try {
    const { text, image } = await req.json();
    if (!text || !image) {
      return NextResponse.json({ error: "Missing text or image" }, { status: 400 });
    }
    // 1. Upload image to Imgur
    const imageUrl = await uploadToImgur(image);

    // 2. Post cast to Farcaster via Neynar (Warpcast) API
    // Docs: https://docs.neynar.com/reference/post-cast
    const res = await fetch("https://api.neynar.com/v2/farcaster/cast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Api-Key": NEYNAR_API_KEY,
      },
      body: JSON.stringify({
        signer_uuid: WARPCAST_SIGNER_UUID,
        text,
        embeds: [imageUrl],
        channel_id: null,
        parent: null,
        fid: Number(WARPCAST_FID),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.error || "Failed to post cast" }, { status: 500 });
    }
    return NextResponse.json({ success: true, cast: json });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic"; 