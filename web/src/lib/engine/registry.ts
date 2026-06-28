import { BaseNodeExecutor } from "./base";
import type { WorkflowNode } from "./types";
import { TriggerNodeExecutor } from "./executors/trigger";
import { OutputNodeExecutor } from "./executors/output";
import { FlowNodeExecutor } from "./executors/flow";
import { DataNodeExecutor } from "./executors/data";
import { ActionNodeExecutor } from "./executors/action";
import {
  AINodeExecutor,
  ChatModelExecutor,
  MemoryExecutor,
  ToolExecutor,
} from "./executors/ai";
import { Web3NodeExecutor } from "./executors/web3";

type ExecutorCtor = new (
  nodeId: string,
  nodeType: string,
  nodeData: WorkflowNode["data"]
) => BaseNodeExecutor;

const TRIGGER = ["when-chat-received", "webhook", "schedule", "manual-trigger"];
const AI = [
  "ai-agent",
  "openai",
  "anthropic",
  "google-gemini",
  "groq-llama",
  "groq-gemma",
  "question-answer-chain",
  "summarization-chain",
  "information-extractor",
  "text-classifier",
  "sentiment-analysis",
];
const CHAT_MODEL = ["gpt-4-turbo", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"];
const MEMORY = ["simple-memory", "vector-memory", "window-buffer-memory", "agent-flow-db-memory"];
const TOOL = ["calculator", "web-search", "duckduckgo-search", "api-caller"];
const FLOW = ["if-else", "switch", "merge"];
const DATA = ["filter", "edit-fields", "code"];
const ACTION = ["http-request", "google-sheets"];
const OUTPUT = ["respond-to-chat", "readme-viewer"];
const WEB3 = [
  "web3-wallet",
  "web3-get-balance",
  "web3-read-contract",
  "web3-write-contract",
  "web3-send-transaction",
  "web3-erc20-transfer",
  "web3-ens",
  "web3-sign-message",
  "web3-event-trigger",
  "web3-token-balance",
  "web3-gas-price",
  "web3-get-block",
  "web3-tx-status",
  "web3-nft-transfer",
  "web3-chainlink-price",
];

/** Get the appropriate executor instance for a node (ported from _get_node_executor). */
export function getNodeExecutor(node: WorkflowNode): BaseNodeExecutor {
  const nodeId = node.id;
  const nodeType = node.data.type;
  const nodeData = node.data;

  let ctor: ExecutorCtor;
  if (TRIGGER.includes(nodeType)) ctor = TriggerNodeExecutor;
  else if (AI.includes(nodeType)) ctor = AINodeExecutor;
  else if (CHAT_MODEL.includes(nodeType)) ctor = ChatModelExecutor;
  else if (MEMORY.includes(nodeType)) ctor = MemoryExecutor;
  else if (TOOL.includes(nodeType)) ctor = ToolExecutor;
  else if (FLOW.includes(nodeType)) ctor = FlowNodeExecutor;
  else if (DATA.includes(nodeType)) ctor = DataNodeExecutor;
  else if (ACTION.includes(nodeType)) ctor = ActionNodeExecutor;
  else if (OUTPUT.includes(nodeType)) ctor = OutputNodeExecutor;
  else if (WEB3.includes(nodeType)) ctor = Web3NodeExecutor;
  else throw new Error(`Unknown node type: ${nodeType}`);

  return new ctor(nodeId, nodeType, nodeData);
}
