/** Core workflow graph + execution types (ported from the Django engine). */

export interface WorkflowNode {
  id: string;
  data: {
    type: string;
    label?: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface WorkflowEdge {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  [key: string]: unknown;
}

/** Per-node execution context passed to each executor's execute(). */
export interface ExecContext {
  execution_id: string;
  workflow_id: string;
  trigger_data: Record<string, unknown>;
  credentials: Record<string, unknown>;
  user_id?: string | null;
  openai_api_key?: string | null;
  anthropic_api_key?: string | null;
  google_api_key?: string | null;
  groq_api_key?: string | null;
  /** Set by output nodes; surfaced as the workflow chat_response. */
  chat_response?: string;
  [key: string]: unknown;
}

export type NodeInputs = Record<string, unknown>;
export type NodeResult = Record<string, unknown>;

export interface NodeState {
  status: string;
  timestamp?: string;
  startTime?: number;
  endTime?: number;
  output?: unknown;
  input?: unknown;
  error?: string;
  duration?: number;
  durationMs?: number;
  durationSeconds?: number;
  [key: string]: unknown;
}
