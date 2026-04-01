import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  APPLICATION_BLOCKING_REPAIR_STORY_STATUSES,
  isTerminalRepairStoryStatus,
  TERMINAL_REPAIR_STORY_STATUSES,
} from "@/lib/repairStoryStatus";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: listingId } = await context.params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, authorId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const isAuthor = listing.authorId === session.userId;
  const stories = await prisma.repairStory.findMany({
    where: isAuthor ? { listingId } : { listingId, repairerUserId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      repairer: { select: { id: true, name: true, email: true } },
      branchedFrom: { select: { id: true, status: true } },
    },
  });

  return NextResponse.json({ stories });
}

export async function POST(request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (user?.role !== "REPAIRER") {
    return NextResponse.json({ error: "Only repairer accounts can apply to a case." }, { status: 403 });
  }

  const { id: listingId } = await context.params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, authorId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.authorId === session.userId) {
    return NextResponse.json({ error: "You cannot apply to your own listing." }, { status: 403 });
  }

  let branchedFromId: string | null | undefined;
  try {
    const body = await request.json();
    branchedFromId =
      typeof body?.branchedFromId === "string" && body.branchedFromId.trim().length > 0
        ? body.branchedFromId.trim()
        : null;
  } catch {
    branchedFromId = null;
  }

  const agreedElsewhere = await prisma.repairStory.findFirst({
    where: {
      listingId,
      status: { in: [...APPLICATION_BLOCKING_REPAIR_STORY_STATUSES] },
    },
    select: { id: true, status: true },
  });
  if (agreedElsewhere) {
    return NextResponse.json(
      { error: "Repaire agreed elsewhere. New applications are closed for this case.", storyId: agreedElsewhere.id },
      { status: 409 },
    );
  }

  const active = await prisma.repairStory.findFirst({
    where: {
      listingId,
      repairerUserId: session.userId,
      NOT: {
        status: { in: [...TERMINAL_REPAIR_STORY_STATUSES] },
      },
    },
  });
  if (active) {
    return NextResponse.json(
      { error: "You already have an open repair story on this case.", storyId: active.id },
      { status: 409 },
    );
  }

  if (branchedFromId) {
    const parent = await prisma.repairStory.findFirst({
      where: {
        id: branchedFromId,
        listingId,
        repairerUserId: session.userId,
      },
    });
    if (!parent) {
      return NextResponse.json({ error: "Invalid branch parent story." }, { status: 400 });
    }
    if (!isTerminalRepairStoryStatus(parent.status)) {
      return NextResponse.json(
        { error: "You can only branch from a closed story (cannot fix, cancelled, or paid)." },
        { status: 400 },
      );
    }
    if (parent.status === "PAID") {
      return NextResponse.json({ error: "Cannot branch from a completed paid story." }, { status: 400 });
    }
  }

  const story = await prisma.repairStory.create({
    data: {
      listingId,
      repairerUserId: session.userId,
      status: "APPLIED",
      branchedFromId: branchedFromId ?? undefined,
    },
    select: {
      id: true,
      status: true,
      listingId: true,
      branchedFromId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(story, { status: 201 });
}
