import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";

/** Executor for output nodes (ported from output_nodes.py). */
export class OutputNodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "respond-to-chat":
        return this.respondToChat(inputs, context);
      case "readme-viewer":
        return this.readmeViewer(inputs, context);
      default:
        throw new NodeExecutionError(`Unknown output node type: ${this.nodeType}`);
    }
  }

  private respondToChat(inputs: NodeInputs, context: ExecContext): NodeResult {
    let message = this.getProperty<string>("message", "");
    if (!message && inputs.main) {
      const input = inputs.main;
      if (input && typeof input === "object") {
        const d = input as Record<string, unknown>;
        message = (d.text as string) || (d.message as string) || JSON.stringify(d);
      } else {
        message = String(input);
      }
    }
    this.logExecution(`Responding to chat with message: ${message.slice(0, 100)}...`);
    // Surface the chat response on the shared context (engine reads this).
    context.chat_response = message;
    return {
      main: {
        response: message,
        text: message,
        timestamp: new Date().toISOString(),
        type: "chat_response",
      },
    };
  }

  private readmeViewer(inputs: NodeInputs, context: ExecContext): NodeResult {
    let content = "";
    if (inputs.main) {
      const input = inputs.main;
      if (input && typeof input === "object") {
        const d = input as Record<string, unknown>;
        content =
          (d.text as string) ||
          (d.content as string) ||
          (d.response as string) ||
          JSON.stringify(d, null, 2);
      } else {
        content = String(input);
      }
    }
    const title = this.getProperty<string>("title", "Content Viewer");
    this.logExecution(`Displaying content in README viewer: ${title}`);
    // Also surface the content as the chat response so a workflow that ends in a
    // README viewer still drives a dApp UI (which reads `chat_response`). One
    // output node now works for both the editor canvas and a linked page.
    context.chat_response = content;
    return {
      main: {
        title,
        content,
        timestamp: new Date().toISOString(),
        type: "readme_viewer",
        formatted: true,
      },
    };
  }
}
