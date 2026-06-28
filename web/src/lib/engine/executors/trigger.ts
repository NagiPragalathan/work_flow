import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";

/** Executor for trigger nodes (ported from trigger_nodes.py). */
export class TriggerNodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "when-chat-received":
        return this.chatTrigger(context);
      case "webhook":
        return this.webhook(context);
      case "schedule":
        return this.schedule(context);
      case "manual-trigger":
        return this.manualTrigger(context);
      default:
        throw new NodeExecutionError(`Unknown trigger node type: ${this.nodeType}`);
    }
  }

  private chatTrigger(context: ExecContext): NodeResult {
    const channel = this.getProperty<string>("channel", "");
    const td = context.trigger_data ?? {};
    const message = (td.message as string) ?? "";
    const user = (td.user as string) ?? "anonymous";
    const timestamp = (td.timestamp as string) ?? "";
    this.logExecution(`Chat trigger activated from channel: ${channel}`);
    return { main: { message, user, channel, timestamp, text: message } };
  }

  private webhook(context: ExecContext): NodeResult {
    const path = this.getProperty<string>("path", "/webhook");
    const methods = this.getProperty("method", ["POST"]);
    const webhookData = context.trigger_data ?? {};
    this.logExecution(`Webhook trigger activated on path: ${path}`);
    return { main: { path, methods, data: webhookData, text: JSON.stringify(webhookData) } };
  }

  private schedule(context: ExecContext): NodeResult {
    const interval = this.getProperty<string>("interval", "hours");
    const value = this.getProperty<number>("value", 1);
    this.logExecution(`Schedule trigger activated (every ${value} ${interval})`);
    return {
      main: {
        interval,
        value,
        triggered_at: (context.trigger_data?.timestamp as string) ?? "",
        text: `Scheduled execution every ${value} ${interval}`,
      },
    };
  }

  private manualTrigger(context: ExecContext): NodeResult {
    this.logExecution("Manual trigger activated");
    const td = context.trigger_data ?? {};
    const message =
      this.getProperty<string>("message", "") ||
      (td.message as string) ||
      (td.text as string) ||
      "Manual execution started";
    this.logExecution(`Manual trigger message: '${message}'`);
    return { main: { triggered_manually: true, message, text: message } };
  }
}
