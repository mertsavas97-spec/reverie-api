import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

type GenerateDreamImageRequest = {
  prompt?: unknown;
  mode?: unknown;
};

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseBody(body: VercelRequest["body"]): GenerateDreamImageRequest {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as GenerateDreamImageRequest;
    } catch {
      return {};
    }
  }

  if (body && typeof body === "object") {
    return body as GenerateDreamImageRequest;
  }

  return {};
}

function createImagePrompt(prompt: string, mode: string): string {
  const trimmedMode = mode.trim();

  if (!trimmedMode) {
    return prompt;
  }

  return `Create a vivid portrait-oriented dream image in this mode: ${trimmedMode}.\n\nDream prompt: ${prompt}`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = parseBody(req.body);

  if (typeof body.prompt !== "string" || body.prompt.trim().length < 20) {
    res.status(400).json({
      error: "Prompt is required and must be at least 20 characters long.",
    });
    return;
  }

  if (body.mode !== undefined && typeof body.mode !== "string") {
    res.status(400).json({ error: "Mode must be a string." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "Image generation is not configured." });
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: createImagePrompt(body.prompt.trim(), body.mode ?? ""),
      size: "1024x1536",
    });

    const imageBase64 = image.data?.[0]?.b64_json;

    if (!imageBase64) {
      res.status(502).json({ error: "Image generation failed." });
      return;
    }

    res.status(200).json({ imageBase64 });
  } catch (error) {
    console.error("OpenAI image generation failed", error);
    res.status(500).json({ error: "Image generation failed." });
  }
}
