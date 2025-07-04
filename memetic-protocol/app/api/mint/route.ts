import { NextRequest } from "next/server";
import { setApiKey, createMetadataBuilder, createZoraUploaderForCreator, createCoin, DeployCurrency } from "@zoralabs/coins-sdk";
import { createWalletClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

setApiKey(process.env.ZORA_API_KEY);

console.log("[DEBUG] ZORA_API_KEY present:", !!process.env.ZORA_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { coinName, coinSymbol, memeImage, userAddress, rpcUrl } = await req.json();
    console.log("[DEBUG] userAddress:", userAddress, "coinName:", coinName);

    // Convert base64 image to File
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

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
    const walletClient = createWalletClient({
      account: userAddress,
      chain: baseSepolia,
      transport: http(rpcUrl),
    });
    const coinParams = {
      ...createMetadataParameters,
      payoutRecipient: userAddress,
      currency: DeployCurrency.ZORA,
    };
    const result = await createCoin(coinParams, walletClient, publicClient);

    return new Response(JSON.stringify({ hash: result.hash, address: result.address }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
} 