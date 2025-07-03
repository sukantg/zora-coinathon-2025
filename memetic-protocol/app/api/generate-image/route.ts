import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing OpenAI API key" }), { status: 500 });
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url;
  return new Response(JSON.stringify({ imageUrl }), { status: 200 });
} 