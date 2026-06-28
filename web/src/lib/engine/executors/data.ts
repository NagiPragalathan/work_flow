import { BaseNodeExecutor, NodeExecutionError } from "../base";
import type { ExecContext, NodeInputs, NodeResult } from "../types";

function asObject(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Executor for data transformation nodes (ported from data_nodes.py). */
export class DataNodeExecutor extends BaseNodeExecutor {
  async execute(inputs: NodeInputs, context: ExecContext): Promise<NodeResult> {
    switch (this.nodeType) {
      case "filter":
        return this.filter(inputs);
      case "edit-fields":
        return this.editFields(inputs);
      case "code":
        return this.code(inputs);
      default:
        throw new NodeExecutionError(`Unknown data node type: ${this.nodeType}`);
    }
  }

  private filter(inputs: NodeInputs): NodeResult {
    this.validateInputs(inputs, ["main"]);
    const inputData = asObject(inputs.main);
    const field = this.getProperty<string>("field", "");
    const operator = this.getProperty<string>("operator", "equals");
    const value = this.getProperty<unknown>("value", "");
    if (!field) throw new NodeExecutionError("No field specified for filter");

    const keep = this.evaluate(inputData[field], operator, value);
    this.logExecution(`Filter condition: ${field} ${operator} ${value} = ${keep}`);
    return { main: keep ? inputData : null };
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
        return true;
    }
  }

  private editFields(inputs: NodeInputs): NodeResult {
    this.validateInputs(inputs, ["main"]);
    const inputData = { ...asObject(inputs.main) };
    const fields = this.getProperty<Array<Record<string, unknown>>>("fields", []);
    for (const f of fields) {
      const key = f.key as string;
      if (key) inputData[key] = f.value;
    }
    this.logExecution(`Edited ${fields.length} fields`);
    return { main: inputData };
  }

  private code(inputs: NodeInputs): NodeResult {
    this.validateInputs(inputs, ["main"]);
    const inputData = inputs.main;
    const language = this.getProperty<string>("language", "javascript");
    const code = this.getProperty<string>("code", "");
    if (!code) throw new NodeExecutionError("No code provided");

    if (language === "javascript") {
      try {
        // Runs in the Node server context. `$input` is available to the snippet,
        // which should assign its output to `result`.
        const fn = new Function("$input", `let result = $input;\n${code}\nreturn result;`);
        const result = fn(inputData);
        this.logExecution("JavaScript code executed successfully");
        return { main: result };
      } catch (e) {
        throw new NodeExecutionError(
          `JavaScript code execution failed: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
    if (language === "python") {
      throw new NodeExecutionError(
        "Python code execution is not supported in the Node runtime. Use JavaScript."
      );
    }
    throw new NodeExecutionError(`Unsupported language: ${language}`);
  }
}
