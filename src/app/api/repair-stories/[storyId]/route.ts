import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  isAllowedEscrowState,
  isAllowedRepairStoryStatus,
  isTerminalRepairStoryStatus,
} from "@/lib/repairStoryStatus";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ storyId: string }> };

async function loadStoryForUser(storyId: string, userId: string) {
  const story = await prisma.repairStory.findUnique({
    where: { id: storyId },
    include: {
      listing: { select: { id: true, title: true, authorId: true } },
      repairer: { select: { id: true, name: true, email: true } },
      branchedFrom: { select: { id: true, status: true } },
    },
  });
  if (!story) return { error: "NOT_FOUND" as const };
  const isAuthor = story.listing.authorId === userId;
  const isRepairer = story.repairerUserId === userId;
  if (!isAuthor && !isRepairer) return { error: "FORBIDDEN" as const };
  return { story, isAuthor, isRepairer };
}

export async function GET(_request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storyId } = await context.params;
  const result = await loadStoryForUser(storyId, session.userId);
  if (result.error === "NOT_FOUND") {
    return NextResponse.json({ error: "Repair story not found" }, { status: 404 });
  }
  if (result.error === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { story } = result;
  return NextResponse.json({
    story: {
      id: story.id,
      listingId: story.listingId,
      status: story.status,
      branchedFromId: story.branchedFromId,
      agreedPriceCents: story.agreedPriceCents,
      escrowState: story.escrowState,
      agreedAt: story.agreedAt?.toISOString() ?? null,
      jobCompletedAt: story.jobCompletedAt?.toISOString() ?? null,
      paidAt: story.paidAt?.toISOString() ?? null,
      closedReason: story.closedReason,
      customerScore: story.customerScore,
      repairerScore: story.repairerScore,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
      listing: story.listing,
      repairer: story.repairer,
      branchedFrom: story.branchedFrom,
    },
  });
}

type PatchBody = {
  status?: unknown;
  agreedPriceCents?: unknown;
  escrowState?: unknown;
  closedReason?: unknown;
  customerScore?: unknown;
  repairerScore?: unknown;
  agreedAt?: unknown;
  jobCompletedAt?: unknown;
  paidAt?: unknown;
};

export async function PATCH(request: NextRequest, context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storyId } = await context.params;
  const result = await loadStoryForUser(storyId, session.userId);
  if (result.error === "NOT_FOUND") {
    return NextResponse.json({ error: "Repair story not found" }, { status: 404 });
  }
  if (result.error === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { story, isAuthor, isRepairer } = result;

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: Prisma.RepairStoryUpdateInput = {};

  const terminal = isTerminalRepairStoryStatus(story.status);
  const patchKeys = Object.keys(body).filter((k) => body[k as keyof PatchBody] !== undefined);
  const onlyRatingPatch = patchKeys.every((k) => k === "customerScore" || k === "repairerScore");
  if (terminal && !onlyRatingPatch) {
    return NextResponse.json(
      { error: "This repair story is closed. You can still update customerScore / repairerScore if needed." },
      { status: 409 },
    );
  }

  if (body.status !== undefined) {
    if (terminal) {
      return NextResponse.json({ error: "Cannot change status on a closed story." }, { status: 409 });
    }
    if (typeof body.status !== "string" || !isAllowedRepairStoryStatus(body.status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (body.agreedPriceCents !== undefined) {
    if (body.agreedPriceCents === null) {
      data.agreedPriceCents = null;
    } else if (typeof body.agreedPriceCents === "number" && Number.isInteger(body.agreedPriceCents) && body.agreedPriceCents >= 0) {
      data.agreedPriceCents = body.agreedPriceCents;
    } else {
      return NextResponse.json({ error: "agreedPriceCents must be a non-negative integer or null." }, { status: 400 });
    }
  }

  if (body.escrowState !== undefined) {
    if (typeof body.escrowState !== "string" || !isAllowedEscrowState(body.escrowState)) {
      return NextResponse.json({ error: "Invalid escrowState." }, { status: 400 });
    }
    data.escrowState = body.escrowState;
  }

  if (body.closedReason !== undefined) {
    data.closedReason = typeof body.closedReason === "string" ? body.closedReason.slice(0, 500) : null;
  }

  if (body.customerScore !== undefined) {
    if (!isAuthor) {
      return NextResponse.json({ error: "Only the listing owner can set customerScore." }, { status: 403 });
    }
    if (body.customerScore === null) {
      data.customerScore = null;
    } else if (typeof body.customerScore === "number" && body.customerScore >= 1 && body.customerScore <= 5) {
      data.customerScore = Math.round(body.customerScore);
    } else {
      return NextResponse.json({ error: "customerScore must be 1–5 or null." }, { status: 400 });
    }
  }

  if (body.repairerScore !== undefined) {
    if (!isRepairer) {
      return NextResponse.json({ error: "Only the repairer can set repairerScore." }, { status: 403 });
    }
    if (body.repairerScore === null) {
      data.repairerScore = null;
    } else if (typeof body.repairerScore === "number" && body.repairerScore >= 1 && body.repairerScore <= 5) {
      data.repairerScore = Math.round(body.repairerScore);
    } else {
      return NextResponse.json({ error: "repairerScore must be 1–5 or null." }, { status: 400 });
    }
  }

  function parseDate(value: unknown): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== "string") return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  const agreedAt = parseDate(body.agreedAt);
  if (body.agreedAt !== undefined && agreedAt === undefined && body.agreedAt !== null) {
    return NextResponse.json({ error: "Invalid agreedAt." }, { status: 400 });
  }
  if (agreedAt !== undefined) data.agreedAt = agreedAt;

  const jobCompletedAt = parseDate(body.jobCompletedAt);
  if (body.jobCompletedAt !== undefined && jobCompletedAt === undefined && body.jobCompletedAt !== null) {
    return NextResponse.json({ error: "Invalid jobCompletedAt." }, { status: 400 });
  }
  if (jobCompletedAt !== undefined) data.jobCompletedAt = jobCompletedAt;

  const paidAt = parseDate(body.paidAt);
  if (body.paidAt !== undefined && paidAt === undefined && body.paidAt !== null) {
    return NextResponse.json({ error: "Invalid paidAt." }, { status: 400 });
  }
  if (paidAt !== undefined) data.paidAt = paidAt;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const updated = await prisma.repairStory.update({
    where: { id: storyId },
    data,
    include: {
      listing: { select: { id: true, title: true, authorId: true } },
      repairer: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    story: {
      id: updated.id,
      listingId: updated.listingId,
      status: updated.status,
      branchedFromId: updated.branchedFromId,
      agreedPriceCents: updated.agreedPriceCents,
      escrowState: updated.escrowState,
      agreedAt: updated.agreedAt?.toISOString() ?? null,
      jobCompletedAt: updated.jobCompletedAt?.toISOString() ?? null,
      paidAt: updated.paidAt?.toISOString() ?? null,
      closedReason: updated.closedReason,
      customerScore: updated.customerScore,
      repairerScore: updated.repairerScore,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      listing: updated.listing,
      repairer: updated.repairer,
    },
  });
}
