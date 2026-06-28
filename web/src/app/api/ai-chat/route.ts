import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import type { ModelMessage } from "ai";
import { resolveModel } from "@/lib/engine/providers";
import type { ExecContext } from "@/lib/engine/types";

const PREAMBLE = `You are a helpful AI assistant for a workflow builder application. You can help users with:

- Creating and configuring workflows
- Understanding workflow concepts
- General questions about the platform
- Technical support and guidance

Be friendly, helpful, and provide clear, concise answers.`;

interface HistoryMsg {
  role: string;
  content: string;
}

export async function POST(req: NextRequest) {
  const requestStart = Date.now();
  try {
    const body = await req.json();
    const message: string = body.message ?? "";
    const conversationHistory: HistoryMsg[] = body.conversation_history ?? [];
    const settings = body.settings ?? {};

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const apiKey: string | undefined = settings.apiKey || process.env.GROQ_API_KEY;
    const model: string = settings.model || "llama-3.1-8b-instant";
    const baseURL: string | undefined = settings.baseUrl;

    if (!apiKey) {
      return NextResponse.json({
        response:
          "Please configure your AI settings first. Go to Settings to set up your API key and model.",
        timestamp: String(Date.now()),
      });
    }

    const context = { credentials: {} } as unknown as ExecContext;
    const llm = resolveModel(model, context, { apiKey, baseURL });

    const messages: ModelMessage[] = [];
    for (const m of conversationHistory.slice(-20)) {
      if (m.role === "user" || m.role === "assistant") {
        messages.push({ role: m.role, content: m.content });
      }
    }
    messages.push({ role: "user", content: message });

    const start = Date.now();
    const { text } = await generateText({ model: llm, system: PREAMBLE, messages });
    const executionTime = Date.now() - start;
    const totalTime = Date.now() - requestStart;

    return NextResponse.json({
      response: text,
      timestamp: String(Date.now()),
      execution_time_ms: executionTime,
      total_request_time_ms: totalTime,
    });
  } catch (e) {
    const totalTime = Date.now() - requestStart;
    const msg = e instanceof Error ? e.message : "Unknown error occurred";
    return NextResponse.json(
      {
        error: `AI service unavailable: ${msg}`,
        response:
          "I apologize, but the AI service is currently unavailable. Please try again later.",
        total_request_time_ms: totalTime,
      },
      { status: 503 }
    );
  }
}
