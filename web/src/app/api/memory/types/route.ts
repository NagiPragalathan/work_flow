import { NextResponse } from "next/server";

const MEMORY_TYPES = [
  {
    id: "window-buffer-memory",
    name: "Window Buffer Memory",
    description: "Maintains a sliding window of recent messages",
    category: "Built-in",
    features: ["Fast", "Memory efficient", "Real-time"],
  },
  {
    id: "agent-flow-db-memory",
    name: "Agent Flow DB Memory",
    description: "Persistent memory storage using the database - survives server restarts",
    category: "Database",
    features: ["Persistent", "Survives restarts", "Scalable", "Reliable"],
  },
  {
    id: "simple-memory",
    name: "Simple Memory",
    description: "Simple memory storage for conversation context (legacy)",
    category: "Legacy",
    features: ["Simple", "Compatible", "Easy to use"],
  },
  {
    id: "vector-memory",
    name: "Vector Memory",
    description: "Store and retrieve information using vector embeddings (legacy)",
    category: "Legacy",
    features: ["Vector search", "Semantic matching", "Scalable"],
  },
];

export async function GET() {
  return NextResponse.json({ memory_types: MEMORY_TYPES, total: MEMORY_TYPES.length });
}
