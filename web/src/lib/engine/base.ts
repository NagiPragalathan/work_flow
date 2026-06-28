import type { ExecContext, NodeInputs, NodeResult, WorkflowNode } from "./types";

/** Raised when a node fails to execute (ported from NodeExecutionError). */
export class NodeExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NodeExecutionError";
  }
}

/** Base class for all node executors (ported from base.py). */
export abstract class BaseNodeExecutor {
  nodeId: string;
  nodeType: string;
  nodeData: WorkflowNode["data"];
  properties: Record<string, unknown>;
  label: string;

  constructor(nodeId: string, nodeType: string, nodeData: WorkflowNode["data"]) {
    this.nodeId = nodeId;
    this.nodeType = nodeType;
    this.nodeData = nodeData;
    this.properties = (nodeData?.properties as Record<string, unknown>) ?? {};
    this.label = (nodeData?.label as string) ?? nodeType;
  }

  abstract execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult>;

  validateInputs(inputs: NodeInputs, requiredInputs: string[]): void {
    const missing = requiredInputs.filter(
      (inp) => !(inp in inputs) || inputs[inp] == null
    );
    if (missing.length) {
      throw new NodeExecutionError(
        `Node '${this.label}' (${this.nodeId}) is missing required inputs: ${missing.join(", ")}`
      );
    }
  }

  getProperty<T = unknown>(key: string, def?: T): T {
    const val = this.properties[key];
    return (val === undefined ? def : val) as T;
  }

  logExecution(message: string, level: "info" | "warn" | "error" = "info") {
    const line = `[${this.nodeId}] ${this.label}: ${message}`;
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }
}
