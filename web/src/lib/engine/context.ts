import type { NodeState } from "./types";

/** Stores execution state and results (ported from ExecutionContext). */
export class ExecutionContext {
  workflowId: string;
  executionId: string;
  nodeResults: Record<string, unknown> = {};
  nodeStates: Record<string, NodeState> = {};
  executionOrder: string[] = [];
  errors: Record<string, string> = {};
  startTime: Date = new Date();
  endTime: Date | null = null;
  status: string = "running";
  triggerData: Record<string, unknown> = {};
  credentials: Record<string, unknown> = {};
  chatResponse: string | null = null;

  constructor(workflowId: string, executionId: string) {
    this.workflowId = workflowId;
    this.executionId = executionId;
  }

  setNodeState(nodeId: string, status: string, extra: Partial<NodeState> = {}) {
    const now = new Date();
    const existing = this.nodeStates[nodeId] ?? {};
    this.nodeStates[nodeId] = {
      ...existing,
      status,
      timestamp: now.toISOString(),
      endTime: now.getTime(),
      ...extra,
    };
    if (existing.startTime === undefined) {
      this.nodeStates[nodeId].startTime = now.getTime();
    }
  }

  setNodeResult(nodeId: string, result: unknown) {
    this.nodeResults[nodeId] = result;
  }

  getNodeDuration(nodeId: string): number {
    const s = this.nodeStates[nodeId];
    if (s?.startTime && s?.endTime) return s.endTime - s.startTime;
    return 0;
  }

  setNodeError(nodeId: string, error: string) {
    this.errors[nodeId] = error;
    this.setNodeState(nodeId, "error", { error });
  }

  getNodeResult(nodeId: string): unknown {
    return this.nodeResults[nodeId];
  }

  complete(status: string = "completed") {
    this.status = status;
    this.endTime = new Date();
  }

  toDict() {
    let duration: number | null = null;
    if (this.endTime && this.startTime) {
      duration = (this.endTime.getTime() - this.startTime.getTime()) / 1000;
    }

    const enhancedNodeStates: Record<string, NodeState> = {};
    for (const [nodeId, state] of Object.entries(this.nodeStates)) {
      const d = this.getNodeDuration(nodeId);
      enhancedNodeStates[nodeId] = {
        ...state,
        duration: d,
        durationMs: d,
        durationSeconds: d > 0 ? d / 1000 : 0,
      };
    }

    return {
      execution_id: this.executionId,
      workflow_id: this.workflowId,
      status: this.status,
      start_time: this.startTime.toISOString(),
      end_time: this.endTime ? this.endTime.toISOString() : null,
      duration,
      execution_order: this.executionOrder,
      node_states: enhancedNodeStates,
      errors: this.errors,
      chat_response: this.chatResponse,
    };
  }
}
