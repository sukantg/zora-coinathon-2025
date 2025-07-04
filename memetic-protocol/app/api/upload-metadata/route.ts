import { NextRequest } from "next/server";
import { setApiKey, createMetadataBuilder, createZoraUploaderForCreator } from "@zoralabs/coins-sdk";

setApiKey(process.env.ZORA_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { coinName, coinSymbol, memeImage, userAddress } = await req.json();

    function base64ToFile(base64: string, filename: string): File {
      const arr = base64.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = Buffer.from(arr[1], "base64");
      return new File([bstr], filename, { type: mime });
    }
    const memeFile = base64ToFile(memeImage, "meme.png");

    const { createMetadataParameters } = await createMetadataBuilder()
      .withName(coinName)
      .withSymbol(coinSymbol)
      .withDescription("A meme coin created with Memetic Protocol")
      .withImage(memeFile)
      .upload(createZoraUploaderForCreator(userAddress));

    return new Response(JSON.stringify({ createMetadataParameters }), { status: 200 });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message || String(err) }), { status: 500 });
  }
} 