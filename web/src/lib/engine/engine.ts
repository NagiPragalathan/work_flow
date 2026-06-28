/**
 * Workflow execution engine — ported from execution_engine.py.
 * Topological-sort orchestration of node executors.
 */
import { ExecutionContext } from "./context";
import { getNodeExecutor } from "./registry";
import type { ExecContext, NodeInputs, WorkflowEdge, WorkflowNode } from "./types";

export class WorkflowExecutionEngine {
  activeExecutions = new Map<string, ExecutionContext>();

  private topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    for (const n of nodes) {
      inDegree.set(n.id, 0);
      adjacency.set(n.id, []);
    }
    for (const e of edges) {
      adjacency.get(e.source)?.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
    }
    const queue: string[] = [];
    for (const [id, deg] of inDegree) if (deg === 0) queue.push(id);

    const order: string[] = [];
    while (queue.length) {
      const current = queue.shift()!;
      order.push(current);
      for (const neighbor of adjacency.get(current) ?? []) {
        inDegree.set(neighbor, (inDegree.get(neighbor) ?? 0) - 1);
        if (inDegree.get(neighbor) === 0) queue.push(neighbor);
      }
    }
    if (order.length !== nodes.length) {
      throw new Error("Workflow contains cycles or unreachable nodes");
    }
    return order;
  }

  private getNodeInputs(
    nodeId: string,
    edges: WorkflowEdge[],
    context: ExecutionContext
  ): NodeInputs {
    const inputs: NodeInputs = {};
    for (const edge of edges) {
      if (edge.target !== nodeId) continue;
      const sourceOutput = edge.sourceHandle ?? "main";
      const targetInput = edge.targetHandle ?? "main";
      const sourceResult = context.getNodeResult(edge.source);
      if (sourceResult) {
        let outputData: unknown = sourceResult;
        if (
          sourceResult &&
          typeof sourceResult === "object" &&
          sourceOutput in (sourceResult as Record<string, unknown>)
        ) {
          outputData = (sourceResult as Record<string, unknown>)[sourceOutput];
        }
        inputs[targetInput] = outputData;
      }
    }
    return inputs;
  }

  private async executeNode(
    node: WorkflowNode,
    edges: WorkflowEdge[],
    context: ExecutionContext
  ): Promise<unknown> {
    const nodeId = node.id;
    const nodeType = node.data.type;
    try {
      context.setNodeState(nodeId, "running");
      const inputs = this.getNodeInputs(nodeId, edges, context);
      const executor = getNodeExecutor(node);

      const execContext: ExecContext = {
        execution_id: context.executionId,
        workflow_id: context.workflowId,
        trigger_data: context.triggerData,
        credentials: context.credentials,
        user_id: (context.credentials?.user_id as string) ?? null,
        openai_api_key: context.credentials.openai_api_key as string,
        anthropic_api_key: context.credentials.anthropic_api_key as string,
        google_api_key: context.credentials.google_api_key as string,
        groq_api_key: context.credentials.groq_api_key as string,
      };

      console.log(`Executing node ${nodeId} (${nodeType})`);
      const result = await executor.execute(inputs, execContext);

      context.setNodeResult(nodeId, result);
      context.setNodeState(nodeId, "completed", { output: result, input: inputs });
      context.executionOrder.push(nodeId);

      if (execContext.chat_response !== undefined) {
        context.chatResponse = execContext.chat_response;
      }
      console.log(`Node ${nodeId} completed successfully`);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`Node ${nodeId} failed: ${msg}`);
      context.setNodeError(nodeId, msg);
      throw e;
    }
  }

  private getDependencies(nodeId: string, edges: WorkflowEdge[]): Set<string> {
    const deps = new Set<string>();
    const queue = [nodeId];
    while (queue.length) {
      const current = queue.shift()!;
      for (const e of edges) {
        if (e.target === current && !deps.has(e.source)) {
          deps.add(e.source);
          queue.push(e.source);
        }
      }
    }
    return deps;
  }

  private getDownstream(nodeId: string, edges: WorkflowEdge[]): Set<string> {
    const down = new Set<string>();
    const queue = [nodeId];
    while (queue.length) {
      const current = queue.shift()!;
      for (const e of edges) {
        if (e.source === current && !down.has(e.target)) {
          down.add(e.target);
          queue.push(e.target);
        }
      }
    }
    return down;
  }

  async executeWorkflow(params: {
    workflowId: string;
    executionId: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    triggerData?: Record<string, unknown>;
    credentials?: Record<string, unknown>;
    startNodeId?: string | null;
  }): Promise<ExecutionContext> {
    const { workflowId, executionId, nodes, edges } = params;
    const context = new ExecutionContext(workflowId, executionId);
    context.triggerData = params.triggerData ?? {};
    context.credentials = params.credentials ?? {};
    this.activeExecutions.set(executionId, context);

    try {
      if (params.startNodeId) {
        const subgraph = new Set<string>([
          ...this.getDependencies(params.startNodeId, edges),
          params.startNodeId,
          ...this.getDownstream(params.startNodeId, edges),
        ]);
        const subNodes = nodes.filter((n) => subgraph.has(n.id));
        const subEdges = edges.filter(
          (e) => subgraph.has(e.source) && subgraph.has(e.target)
        );
        const order = this.topologicalSort(subNodes, subEdges);
        for (const nodeId of order) {
          const node = nodes.find((n) => n.id === nodeId)!;
          await this.executeNode(node, edges, context);
        }
      } else {
        const order = this.topologicalSort(nodes, edges);
        for (const nodeId of order) {
          const node = nodes.find((n) => n.id === nodeId)!;
          await this.executeNode(node, edges, context);
        }
      }
      context.complete("completed");
    } catch (e) {
      console.error(`Workflow execution failed: ${e instanceof Error ? e.message : String(e)}`);
      context.complete("error");
    }
    return context;
  }

  getExecution(executionId: string): ExecutionContext | undefined {
    return this.activeExecutions.get(executionId);
  }
}

// Global engine instance (mirrors the module-level singleton in Django).
const g = globalThis as unknown as { __engine?: WorkflowExecutionEngine };
export const executionEngine = g.__engine ?? (g.__engine = new WorkflowExecutionEngine());
