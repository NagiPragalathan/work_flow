import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Executor for action/integration nodes (ported from action_nodes.py). */
export class ActionNodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "http-request":
        return this.httpRequest(inputs);
      case "google-sheets":
        return this.googleSheets(inputs);
      case "respond-to-chat":
        return this.respondToChat(inputs, context);
      default:
        throw new NodeExecutionError(`Unknown action node type: ${this.nodeType}`);
    }
  }

  private async httpRequest(inputs: NodeInputs): Promise<NodeResult> {
    this.validateInputs(inputs, ["main"]);
    const method = this.getProperty<string>("method", "GET").toUpperCase();
    const url = this.getProperty<string>("url", "");
    const headerList = this.getProperty<Array<Record<string, unknown>>>("headers", []);
    const body = this.getProperty<unknown>("body", "{}");
    if (!url) throw new NodeExecutionError("No URL specified for HTTP request");

    const headers: Record<string, string> = {};
    for (const h of headerList) {
      const key = h.key as string;
      if (key) headers[key] = String(h.value ?? "");
    }

    this.logExecution(`Making ${method} request to ${url}`);
    try {
      const init: RequestInit = { method, headers };
      if (["POST", "PUT", "PATCH"].includes(method)) {
        const data = typeof body === "string" ? body : JSON.stringify(body);
        init.body = data;
        if (!headers["Content-Type"] && !headers["content-type"]) {
          (init.headers as Record<string, string>)["Content-Type"] = "application/json";
        }
      }
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new NodeExecutionError(`HTTP request failed: ${response.status} ${response.statusText}`);
      }
      let responseData: unknown;
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
      this.logExecution(`HTTP request completed with status: ${response.status}`);
      return {
        main: {
          status_code: response.status,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries()),
        },
      };
    } catch (e) {
      if (e instanceof NodeExecutionError) throw e;
      throw new NodeExecutionError(`HTTP request failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private async googleSheets(inputs: NodeInputs): Promise<NodeResult> {
    this.validateInputs(inputs, ["main"]);
    const spreadsheetId = this.getProperty<string>("spreadsheetId", "");
    if (!spreadsheetId) throw new NodeExecutionError("No spreadsheet ID specified");
    throw new NodeExecutionError(
      "Google Sheets integration requires Google API credentials setup"
    );
  }

  private respondToChat(inputs: NodeInputs, context: ExecContext): NodeResult {
    this.validateInputs(inputs, ["main"]);
    const inputData = asObject(inputs.main);
    let message = this.getProperty<string>("message", "");
    if (!message) {
      message =
        (inputData.text as string) || (inputData.message as string) || JSON.stringify(inputData);
    }
    if (!message) throw new NodeExecutionError("No message to respond with");
    this.logExecution(`Responding to chat: ${message.slice(0, 100)}...`);
    context.chat_response = message;
    return {
      main: { message, sent: true, timestamp: (inputData.timestamp as string) ?? "" },
    };
  }
}
