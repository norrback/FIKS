import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ storyId: string }> };

async function assertStoryMessageAccess(storyId: string, userId: string) {
  const story = await prisma.repairStory.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      listingId: true,
      repairerUserId: true,
      listing: { select: { authorId: true } },
    },
  });
  if (!story) return { error: "NOT_FOUND" as const };
  const isAuthor = story.listing.authorId === userId;
  const isRepairer = story.repairerUserId === userId;
  if (!isAuthor && !isRepairer) return { error: "FORBIDDEN" as const };
  return { story };
}

export async function GET(_request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storyId } = await context.params;
  const gate = await assertStoryMessageAccess(storyId, session.userId);
  if (gate.error === "NOT_FOUND") {
    return NextResponse.json({ error: "Repair story not found" }, { status: 404 });
  }
  if (gate.error === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.repairStoryMessage.findMany({
    where: { repairStoryId: storyId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
    })),
  });
}

export async function POST(request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storyId } = await context.params;
  const gate = await assertStoryMessageAccess(storyId, session.userId);
  if (gate.error === "NOT_FOUND") {
    return NextResponse.json({ error: "Repair story not found" }, { status: 404 });
  }
  if (gate.error === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text || text.length > 8000) {
    return NextResponse.json({ error: "Message body is required (max 8000 characters)." }, { status: 400 });
  }

  const msg = await prisma.repairStoryMessage.create({
    data: {
      repairStoryId: storyId,
      senderId: session.userId,
      body: text,
    },
    include: { sender: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(
    {
      message: {
        id: msg.id,
        body: msg.body,
        createdAt: msg.createdAt.toISOString(),
        sender: msg.sender,
      },
    },
    { status: 201 },
  );
}
