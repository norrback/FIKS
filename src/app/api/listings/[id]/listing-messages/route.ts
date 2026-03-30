import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function assertListingMessageAccess(listingId: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, authorId: true },
  });
  if (!listing) return { error: "NOT_FOUND" as const };
  if (listing.authorId === userId) return { listing };
  const asRepairer = await prisma.repairStory.findFirst({
    where: { listingId, repairerUserId: userId },
    select: { id: true },
  });
  if (!asRepairer) return { error: "FORBIDDEN" as const };
  return { listing };
}

export async function GET(_request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await context.params;
  const gate = await assertListingMessageAccess(listingId, session.userId);
  if (gate.error === "NOT_FOUND") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (gate.error === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.listingMessage.findMany({
    where: { listingId },
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

  const { id: listingId } = await context.params;
  const gate = await assertListingMessageAccess(listingId, session.userId);
  if (gate.error === "NOT_FOUND") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (gate.error === "FORBIDDEN") {
    return NextResponse.json(
      { error: "Only the listing owner or a repairer with a story on this case can post here." },
      { status: 403 },
    );
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

  const msg = await prisma.listingMessage.create({
    data: {
      listingId,
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
