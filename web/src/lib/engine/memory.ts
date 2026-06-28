/**
 * Conversation memory for AI nodes. Replaces Alith's WindowBufferMemory /
 * AgentFlowDBMemory. Two backends: persistent (Prisma DB) and in-process.
 */
import { prisma } from "@/lib/prisma";

export interface MemoryMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
}

export interface Memory {
  getMessages(): Promise<MemoryMessage[]>;
  addUserMessage(content: string): Promise<void>;
  addAIMessage(content: string): Promise<void>;
}

/** In-process sliding-window memory (lost on restart). */
export class WindowBufferMemory implements Memory {
  private messages: MemoryMessage[] = [];
  constructor(private windowSize: number = 20) {}

  async getMessages(): Promise<MemoryMessage[]> {
    return this.messages;
  }
  async addUserMessage(content: string) {
    this.messages.push({ role: "user", content });
    this.enforce();
  }
  async addAIMessage(content: string) {
    this.messages.push({ role: "assistant", content });
    this.enforce();
  }
  private enforce() {
    if (this.messages.length > this.windowSize) {
      this.messages = this.messages.slice(this.messages.length - this.windowSize);
    }
  }
}

/** Persistent memory backed by MemoryCollection / MemoryMessage tables. */
export class DBMemory implements Memory {
  constructor(
    private collectionId: string,
    private windowSize: number = 20
  ) {}

  async getMessages(): Promise<MemoryMessage[]> {
    const rows = await prisma.memoryMessage.findMany({
      where: { collectionId: this.collectionId },
      orderBy: { timestamp: "asc" },
    });
    return rows.map((r) => ({ role: r.role as MemoryMessage["role"], content: r.content }));
  }
  async addUserMessage(content: string) {
    await this.save("user", content);
  }
  async addAIMessage(content: string) {
    await this.save("assistant", content);
  }
  private async save(role: string, content: string) {
    await prisma.memoryMessage.create({
      data: { collectionId: this.collectionId, role, content },
    });
    await this.enforce();
  }
  private async enforce() {
    const total = await prisma.memoryMessage.count({
      where: { collectionId: this.collectionId },
    });
    if (total > this.windowSize) {
      const oldest = await prisma.memoryMessage.findMany({
        where: { collectionId: this.collectionId },
        orderBy: { timestamp: "asc" },
        take: total - this.windowSize,
        select: { id: true },
      });
      await prisma.memoryMessage.deleteMany({
        where: { id: { in: oldest.map((m) => m.id) } },
      });
    }
  }
}

// Global in-memory store (mirrors _global_memory_storage in the Django engine).
const globalMemory = globalThis as unknown as {
  __wbMemory?: Map<string, WindowBufferMemory>;
};
globalMemory.__wbMemory ??= new Map();

export function getWindowBufferMemory(key: string, windowSize: number): WindowBufferMemory {
  const store = globalMemory.__wbMemory!;
  let mem = store.get(key);
  if (!mem) {
    mem = new WindowBufferMemory(windowSize);
    store.set(key, mem);
  }
  return mem;
}

/** Get or create a persistent memory collection for a workflow node. */
export async function getOrCreateDBMemory(
  workflowId: string,
  nodeId: string,
  windowSize: number,
  userId?: string | null
): Promise<DBMemory> {
  const name = `workflow_${workflowId}_node_${nodeId}`;
  let collection = await prisma.memoryCollection.findFirst({
    where: { name, userId: userId ?? null },
  });
  if (!collection) {
    collection = await prisma.memoryCollection.create({
      data: {
        name,
        workflowId,
        nodeId,
        windowSize,
        description: "Agent Flow Database Memory",
        userId: userId ?? null,
      },
    });
  }
  return new DBMemory(collection.id, windowSize);
}
