import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Executor for flow control nodes (ported from flow_nodes.py). */
export class FlowNodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "if-else":
        return this.ifElse(inputs);
      case "switch":
        return this.switchNode(inputs);
      case "merge":
        return this.merge(inputs);
      default:
        throw new NodeExecutionError(`Unknown flow node type: ${this.nodeType}`);
    }
  }

  private ifElse(inputs: NodeInputs): NodeResult {
    this.validateInputs(inputs, ["main"]);
    const inputData = asObject(inputs.main);
    const conditions = this.getProperty<Array<Record<string, unknown>>>("conditions", []);
    const combine = this.getProperty<string>("combineOperation", "AND");
    if (!conditions.length) throw new NodeExecutionError("No conditions defined for If node");

    const results = conditions.map((c) =>
      this.evaluate(inputData[(c.field as string) ?? ""], (c.operator as string) ?? "equals", c.value)
    );
    const finalResult = combine === "AND" ? results.every(Boolean) : results.some(Boolean);
    this.logExecution(`If condition evaluated to: ${finalResult}`);
    return finalResult ? { true: inputData, false: null } : { true: null, false: inputData };
  }

  private evaluate(fieldValue: unknown, operator: string, expected: unknown): boolean {
    const a = String(fieldValue ?? "").toLowerCase();
    const b = String(expected ?? "").toLowerCase();
    switch (operator) {
      case "equals":
        return a === b;
      case "notEquals":
        return a !== b;
      case "contains":
        return a.includes(b);
      case "greaterThan":
        return Number(fieldValue) > Number(expected);
      case "lessThan":
        return Number(fieldValue) < Number(expected);
      default:
        return false;
    }
  }

  private switchNode(inputs: NodeInputs): NodeResult {
    this.validateInputs(inputs, ["main"]);
    const inputData = asObject(inputs.main);
    this.logExecution("Switch node routing to output0");
    return { output0: inputData, output1: null, output2: null, output3: null };
  }

  private merge(inputs: NodeInputs): NodeResult {
    const input1 = inputs.input1;
    const input2 = inputs.input2;
    const mode = this.getProperty<string>("mode", "append");
    if (mode === "append") {
      const result = [input1, input2].filter((x) => x != null && (typeof x !== "object" || Object.keys(x).length));
      this.logExecution(`Merged ${result.length} inputs`);
      return { main: { merged: result, count: result.length } };
    }
    if (mode === "merge") {
      this.logExecution("Merged inputs as dictionary");
      return { main: { ...asObject(input1), ...asObject(input2) } };
    }
    this.logExecution("Chose first non-empty input");
    return { main: input1 ? input1 : input2 };
  }
}
