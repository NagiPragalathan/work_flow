/**
 * AI node executors — ported from ai_nodes.py, backed by the Vercel AI SDK
 * instead of the Alith Python SDK.
 */
import { generateText } from "ai";
import type { ModelMessage, ToolSet } from "ai";
import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";
import { resolveModel, baseUrlForModel, buildTools } from "../providers";
import {
  type Memory,
  getWindowBufferMemory,
  getOrCreateDBMemory,
} from "../memory";

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Run a single prompt against a model, threading optional conversation memory. */
async function runPrompt(
  model: ReturnType<typeof resolveModel>,
  opts: {
    system?: string;
    prompt: string;
    memory?: Memory | null;
    tools?: ToolSet;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const messages: ModelMessage[] = [];
  if (opts.memory) {
    const history = await opts.memory.getMessages();
    for (const m of history) {
      if (m.role === "user" || m.role === "assistant" || m.role === "system") {
        messages.push({ role: m.role, content: m.content });
      }
    }
  }
  messages.push({ role: "user", content: opts.prompt });

  const { text } = await generateText({
    model,
    system: opts.system,
    messages,
    temperature: opts.temperature,
    maxOutputTokens: opts.maxTokens,
    tools: opts.tools,
  });

  if (opts.memory) {
    await opts.memory.addUserMessage(opts.prompt);
    await opts.memory.addAIMessage(text);
  }
  return text;
}

export class AINodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "ai-agent":
        return this.aiAgent(inputs, context);
      case "openai":
        return this.openai(inputs, context);
      case "groq-llama":
      case "groq-gemma":
        return this.groq(inputs, context);
      case "anthropic":
        return this.anthropic(inputs, context);
      case "google-gemini":
        return this.googleGemini(inputs, context);
      case "question-answer-chain":
        return this.qaChain(inputs, context);
      case "summarization-chain":
        return this.summarization(inputs, context);
      case "information-extractor":
        return this.extractor(inputs, context);
      case "text-classifier":
        return this.classifier(inputs, context);
      case "sentiment-analysis":
        return this.sentiment(inputs, context);
      default:
        throw new NodeExecutionError(`Unknown AI node type: ${this.nodeType}`);
    }
  }

  private async aiAgent(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const mainInput = asObject(inputs.main);
    const chatModelInput = asObject(inputs["chat-model"]);
    const memoryInput = asObject(inputs.memory);
    const toolsInput = inputs.tools;

    const systemPrompt = this.getProperty<string>(
      "prompt",
      "# AI Agent System Prompt\n\nYou are a helpful AI assistant."
    );
    const model = (chatModelInput.model as string) || "gpt-4-turbo";
    const temperature = (chatModelInput.temperature as number) ?? 0.7;
    const maxTokens = (chatModelInput.max_tokens as number) ?? 1024;
    const apiKey = (chatModelInput.api_key as string) || null;
    const baseURL = (chatModelInput.base_url as string) || null;

    // Memory
    let memory: Memory | null = null;
    if (Object.keys(memoryInput).length) {
      const windowSize =
        (memoryInput.window_size as number) ?? (memoryInput.maxMessages as number) ?? 20;
      const memType = (memoryInput.type as string) || "WindowBufferMemory";
      if (memType === "AgentFlowDBMemory") {
        memory = await getOrCreateDBMemory(
          context.workflow_id,
          this.nodeId,
          windowSize,
          (context.user_id as string) ?? null
        );
      } else {
        memory = getWindowBufferMemory(
          `memory_${this.nodeId}_${context.workflow_id}`,
          windowSize
        );
      }
    }

    const tools = buildTools(toolsInput);
    let system = systemPrompt;
    const toolNames = Object.keys(tools);
    if (toolNames.length) {
      system +=
        `\n\nAvailable tools:\n` +
        toolNames.map((n) => `- ${n}`).join("\n") +
        `\n\nIMPORTANT: Only use the exact tool names listed above.`;
    }

    const prompt =
      (mainInput.text as string) || (mainInput.message as string) || (mainInput.prompt as string);
    if (!prompt) throw new NodeExecutionError("No prompt provided to AI Agent");

    const llm = resolveModel(model, context, { apiKey, baseURL });
    this.logExecution(`Executing AI Agent with prompt: ${prompt.slice(0, 100)}...`);
    const response = await runPrompt(llm, {
      system,
      prompt,
      memory,
      tools: toolNames.length ? tools : undefined,
      temperature,
      maxTokens,
    });

    return { main: { text: response, prompt, model, temperature } };
  }

  private async openai(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const operation = this.getProperty<string>("operation", "chat");
    let message = this.getProperty<string>("message", "");
    if (!message) message = (asObject(inputs.main).text as string) || "";
    if (!message) throw new NodeExecutionError("No message provided to OpenAI node");

    const llm = resolveModel("gpt-4-turbo", context);
    const response = await runPrompt(llm, { prompt: message });
    return { main: { text: response, operation, input: message } };
  }

  private async groq(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const apiKey =
      this.getProperty<string>("api_key", "") ||
      (context.groq_api_key as string) ||
      process.env.GROQ_API_KEY;
    if (!apiKey)
      throw new NodeExecutionError(
        "Groq API key not found. Please configure it in the node settings."
      );

    const model = this.getProperty<string>("model", "llama-3.1-8b-instant");
    const temperature = this.getProperty<number>("temperature", 0.7);
    const maxTokens = this.getProperty<number>("max_tokens", 1024);
    const message = (asObject(inputs.main).text as string) || "";

    // No input => this node acts as a chat-model configuration provider.
    if (!message) {
      return {
        main: {
          model,
          temperature,
          max_tokens: maxTokens,
          base_url: "https://api.groq.com/openai/v1",
          api_key: apiKey,
        },
      };
    }

    const llm = resolveModel(model, context, { apiKey });
    const response = await runPrompt(llm, { prompt: message, temperature, maxTokens });
    return {
      main: { text: response, model, temperature, max_tokens: maxTokens, input: message },
    };
  }

  private async anthropic(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const model = this.getProperty<string>("model", "claude-3-sonnet");
    let prompt = this.getProperty<string>("prompt", "");
    if (!prompt) prompt = (asObject(inputs.main).text as string) || "";
    if (!prompt) throw new NodeExecutionError("No prompt provided to Anthropic node");

    const llm = resolveModel(model, context);
    const response = await runPrompt(llm, { prompt });
    return { main: { text: response, model, input: prompt } };
  }

  private async googleGemini(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    const model = this.getProperty<string>("model", "gemini-pro");
    let prompt = this.getProperty<string>("prompt", "");
    if (!prompt) prompt = (asObject(inputs.main).text as string) || "";
    if (!prompt) throw new NodeExecutionError("No prompt provided to Google Gemini node");

    const llm = resolveModel(model, context);
    const response = await runPrompt(llm, { prompt });
    return { main: { text: response, model, input: prompt } };
  }

  private async qaChain(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    this.validateInputs(inputs, ["main"]);
    const main = asObject(inputs.main);
    let question = this.getProperty<string>("question", "");
    if (!question) question = (main.question as string) || "";
    if (!question) throw new NodeExecutionError("No question provided");
    const documents = (main.documents as string[]) || [];
    if (!documents.length) throw new NodeExecutionError("No documents provided for QA");

    // Lightweight RAG: stuff documents into context (no external vector store).
    const llm = resolveModel("gpt-4-turbo", context);
    const system =
      "Answer the question using only the provided context documents. " +
      "If the answer is not in the context, say you don't know.";
    const prompt = `Context:\n${documents.join("\n\n")}\n\nQuestion: ${question}`;
    const answer = await runPrompt(llm, { system, prompt });
    return { main: { answer, question, documents_count: documents.length } };
  }

  private async summarization(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    this.validateInputs(inputs, ["main"]);
    const text = (asObject(inputs.main).text as string) || "";
    if (!text) throw new NodeExecutionError("No text provided for summarization");
    const maxLength = this.getProperty<number>("maxLength", 500);

    const llm = resolveModel("gpt-4-turbo", context);
    const summary = await runPrompt(llm, {
      system: `You are a summarization assistant. Summarize the following text in approximately ${maxLength} words or less.`,
      prompt: text,
    });
    return {
      main: { summary, original_length: text.length, summary_length: summary.length },
    };
  }

  private async extractor(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    this.validateInputs(inputs, ["main"]);
    const text = (asObject(inputs.main).text as string) || "";
    if (!text) throw new NodeExecutionError("No text provided for extraction");
    const schemaJson = this.getProperty<unknown>("schema", '{"fields": []}');
    const schema =
      typeof schemaJson === "string" ? JSON.parse(schemaJson) : (schemaJson as Record<string, unknown>);
    const fields = (schema.fields as string[]) || [];
    if (!fields.length) throw new NodeExecutionError("No extraction schema defined");

    const llm = resolveModel("gpt-4-turbo", context);
    const system =
      `Extract the following fields from the text and respond with ONLY a JSON object ` +
      `with these keys: ${fields.join(", ")}.`;
    const raw = await runPrompt(llm, { system, prompt: text });
    let extracted: Record<string, unknown> = {};
    try {
      extracted = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      extracted = { raw };
    }
    return { main: { extracted, fields } };
  }

  private async classifier(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    let text = this.getProperty<string>("text", "");
    if (!text) text = (asObject(inputs.main).text as string) || "";
    if (!text) throw new NodeExecutionError("No text provided for classification");
    const categories = this.getProperty<string>("categories", "positive, negative, neutral");
    const categoryList = categories.split(",").map((c) => c.trim());

    const llm = resolveModel("gpt-4-turbo", context);
    const category = await runPrompt(llm, {
      system: `You are a text classifier. Classify the following text into one of these categories: ${categoryList.join(
        ", "
      )}. Respond with only the category name.`,
      prompt: text,
    });
    return {
      main: { category: category.trim(), text, available_categories: categoryList },
    };
  }

  private async sentiment(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    let text = this.getProperty<string>("text", "");
    if (!text) text = (asObject(inputs.main).text as string) || "";
    if (!text) throw new NodeExecutionError("No text provided for sentiment analysis");

    const llm = resolveModel("gpt-4-turbo", context);
    const result = await runPrompt(llm, {
      system:
        "You are a sentiment analysis assistant. Analyze the sentiment of the text and respond with: positive, negative, or neutral, followed by a confidence score (0-1).",
      prompt: text,
    });
    const parts = result.toLowerCase().split(/\s+/);
    const sentiment = parts[0] || "neutral";
    let confidence = 0.5;
    const parsed = parseFloat(parts[1]);
    if (!Number.isNaN(parsed)) confidence = parsed;
    return { main: { sentiment, confidence, text } };
  }
}

/** Chat model nodes — provide model configuration to a connected AI agent. */
export class ChatModelExecutor extends BaseNodeExecutor {
  async execute(): Promise<NodeResult> {
    const model = this.getProperty<string>("model", "gpt-4-turbo");
    const temperature = this.getProperty<number>("temperature", 0.7);
    const maxTokens = this.getProperty<number>("max_tokens", 1024);
    return {
      main: {
        model,
        temperature,
        max_tokens: maxTokens,
        base_url: baseUrlForModel(model),
        node_type: "chat-model",
      },
    };
  }
}

/** Memory nodes — provide memory configuration to a connected AI agent. */
export class MemoryExecutor extends BaseNodeExecutor {
  async execute(): Promise<NodeResult> {
    const config: Record<string, unknown> = {
      node_type: "memory",
      memory_type: this.nodeType,
    };
    if (this.nodeType === "window-buffer-memory") {
      config.type = "WindowBufferMemory";
      config.window_size = this.getProperty("windowSize", 20);
      config.description = "Maintains a sliding window of recent messages";
    } else if (this.nodeType === "agent-flow-db-memory") {
      config.type = "AgentFlowDBMemory";
      config.window_size = this.getProperty("windowSize", 20);
      config.description = "Persistent memory storage using the database";
      config.storage_type = "database";
    } else if (this.nodeType === "simple-memory") {
      config.type = "WindowBufferMemory";
      config.window_size = this.getProperty("maxMessages", 10);
      config.description = "Simple memory storage (legacy)";
    } else if (this.nodeType === "vector-memory") {
      config.type = "WindowBufferMemory";
      config.window_size = 20;
      config.collection_name = this.getProperty("collection", "default");
      config.description = "Memory with vector store integration (legacy)";
    }
    return { main: config };
  }
}

/** Tool nodes — provide tool configuration to a connected AI agent. */
export class ToolExecutor extends BaseNodeExecutor {
  async execute(): Promise<NodeResult> {
    switch (this.nodeType) {
      case "calculator":
        return {
          main: { tool_type: "calculator", precision: this.getProperty("precision", 2), node_type: "tool" },
        };
      case "web-search":
        return {
          main: { tool_type: "web-search", maxResults: this.getProperty("maxResults", 5), node_type: "tool" },
        };
      case "duckduckgo-search":
        return {
          main: {
            tool_type: "duckduckgo-search",
            maxResults: this.getProperty("maxResults", 5),
            region: this.getProperty("region", "us-en"),
            node_type: "tool",
          },
        };
      case "api-caller":
        return {
          main: {
            tool_type: "api-caller",
            url: this.getProperty("url", ""),
            method: this.getProperty("method", "GET"),
            node_type: "tool",
          },
        };
      default:
        return { main: { node_type: "tool" } };
    }
  }
}
