import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, handleApiError } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        total_memories: 0,
        active_memories: 0,
        total_messages: 0,
        memory_types: {},
        storage_usage: {},
      });
    }
    const collections = await prisma.memoryCollection.findMany({ where: { userId: user.id } });
    const totalMessages = await prisma.memoryMessage.count({
      where: { collection: { userId: user.id } },
    });
    const countByName = (kw: string) =>
      collections.filter((c) => c.name.toLowerCase().includes(kw)).length;

    return NextResponse.json({
      total_memories: collections.length,
      active_memories: collections.length,
      total_messages: totalMessages,
      memory_types: {
        "window-buffer-memory": countByName("window"),
        "agent-flow-db-memory": countByName("node"),
        "simple-memory": countByName("simple"),
        "vector-memory": countByName("vector"),
      },
      storage_usage: {
        total_size: `${(totalMessages * 0.001).toFixed(2)} MB`,
        conversation_data: `${(totalMessages * 0.001).toFixed(2)} MB`,
        window_buffer: `${(collections.length * 0.01).toFixed(2)} MB`,
        database_memory: `${(collections.length * 0.01).toFixed(2)} MB`,
      },
    });
  } catch (e) {
    return handleApiError(e);
  }
}
