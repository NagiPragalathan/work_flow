import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { resolveModel } from "@/lib/engine/providers";
import type { ExecContext } from "@/lib/engine/types";

export async function GET() {
  return NextResponse.json({ message: "Test API key endpoint is working", method: "GET" });
}

const MODEL_FOR_NODE: Record<string, string> = {
  "groq-llama": "llama-3.1-8b-instant",
  "groq-gemma": "gemma2-9b-it",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-3.5-turbo": "gpt-3.5-turbo",
  "claude-3-opus": "claude-3-opus-20240229",
  "claude-3-sonnet": "claude-3-5-sonnet-20241022",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nodeType: string = body.nodeType;
    const apiKey: string = body.apiKey;
    const testMessage: string = body.testMessage || "Hello, this is a test message.";

    if (!nodeType || !apiKey) {
      return NextResponse.json(
        { error: "nodeType and apiKey are required" },
        { status: 400 }
      );
    }

    const modelName = MODEL_FOR_NODE[nodeType];
    if (!modelName) {
      return NextResponse.json({ valid: false, error: `Unsupported node type: ${nodeType}` });
    }

    try {
      const context = { credentials: {} } as unknown as ExecContext;
      const llm = resolveModel(modelName, context, { apiKey });
      const { text } = await generateText({
        model: llm,
        prompt: testMessage,
        maxOutputTokens: 50,
      });
      return NextResponse.json({
        valid: true,
        message: `${nodeType} API key is valid`,
        response: text.length > 100 ? text.slice(0, 100) + "..." : text,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error occurred";
      return NextResponse.json({ valid: false, error: `API key test failed: ${msg}` });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error occurred";
    return NextResponse.json({ valid: false, error: `API key test failed: ${msg}` }, { status: 500 });
  }
}
