/**
 * Maps the workflow's model strings (gpt-*, claude-*, gemini-*, llama-*, ...)
 * onto Vercel AI SDK provider models, replacing the Alith Agent abstraction.
 */
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { tool } from "ai";
import { z } from "zod";
import type { LanguageModel, ToolSet } from "ai";
import type { ExecContext } from "./types";
import { NodeExecutionError } from "./base";

export type ProviderKind = "openai" | "anthropic" | "google" | "groq";

export function detectProvider(model: string): ProviderKind {
  if (model.startsWith("llama-") || model.startsWith("mixtral-") || model.startsWith("gemma-"))
    return "groq";
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gemini-")) return "google";
  return "openai"; // gpt-* and default
}

interface ResolveOptions {
  /** Explicit API key (e.g. from a connected chat-model node). */
  apiKey?: string | null;
  baseURL?: string | null;
}

/**
 * Resolve a Vercel AI SDK language model for the given model name, pulling
 * the API key from explicit options -> execution credentials -> env vars.
 */
export function resolveModel(
  model: string,
  context: ExecContext,
  opts: ResolveOptions = {}
): LanguageModel {
  const provider = detectProvider(model);
  const explicit = opts.apiKey || undefined;

  switch (provider) {
    case "groq": {
      const apiKey =
        explicit || (context.groq_api_key as string) || process.env.GROQ_API_KEY;
      if (!apiKey)
        throw new NodeExecutionError(
          "Groq API key not found. Please configure it in the chat model node settings."
        );
      const groq = createGroq({
        apiKey,
        baseURL: opts.baseURL || process.env.GROQ_BASE_URL || undefined,
      });
      return groq(model);
    }
    case "anthropic": {
      const apiKey =
        explicit || (context.anthropic_api_key as string) || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new NodeExecutionError("Anthropic API key not found");
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case "google": {
      const apiKey =
        explicit ||
        (context.google_api_key as string) ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) throw new NodeExecutionError("Google API key not found");
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    default: {
      const apiKey =
        explicit || (context.openai_api_key as string) || process.env.OPENAI_API_KEY;
      if (!apiKey) throw new NodeExecutionError("OpenAI API key not found");
      const openai = createOpenAI({ apiKey, baseURL: opts.baseURL || undefined });
      return openai(model);
    }
  }
}

export function baseUrlForModel(model: string): string | null {
  switch (detectProvider(model)) {
    case "groq":
      return "https://api.groq.com/openai/v1";
    case "anthropic":
      return "https://api.anthropic.com/v1";
    case "google":
      return "https://generativelanguage.googleapis.com/v1";
    default:
      return model.startsWith("gpt-") ? "https://api.openai.com/v1" : null;
  }
}

/** Best-effort DuckDuckGo web search, ported from duckduckgo_tool.py. */
export async function duckduckgoSearch(
  query: string,
  maxResults = 5,
  region = "us-en"
): Promise<string> {
  try {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=${region}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgentFlow/1.0)" },
    });
    const html = await res.text();
    const re =
      /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>[\s\S]*?(?:class="result__snippet"[^>]*>(.*?)<\/a>)?/g;
    const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();
    const results: { title: string; snippet: string; url: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && results.length < maxResults) {
      results.push({ url: m[1], title: strip(m[2] || ""), snippet: strip(m[3] || "") });
    }
    if (!results.length) return `No results found for query: ${query}`;
    return (
      `Search results for '${query}':\n\n` +
      results
        .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   URL: ${r.url}\n`)
        .join("\n")
    );
  } catch (e) {
    return `Search error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/** Build a Vercel AI SDK tool set from the workflow's tool node configs. */
export function buildTools(toolsInput: unknown): ToolSet {
  const tools: ToolSet = {};
  const list = Array.isArray(toolsInput) ? toolsInput : toolsInput ? [toolsInput] : [];
  for (const cfg of list) {
    if (!cfg || typeof cfg !== "object") continue;
    const c = cfg as Record<string, unknown>;
    if (c.tool_type === "duckduckgo-search" || c.tool_type === "web-search") {
      const maxResults = (c.maxResults as number) ?? 5;
      const region = (c.region as string) ?? "us-en";
      tools.duckduckgo_search = tool({
        description: "Search the web using DuckDuckGo for privacy-focused search results",
        inputSchema: z.object({ query: z.string().describe("The search query to look up") }),
        execute: async ({ query }) => duckduckgoSearch(query, maxResults, region),
      });
    }
  }
  return tools;
}
