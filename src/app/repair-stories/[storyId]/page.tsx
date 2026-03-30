import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import RepairStoryWorkspace, { type Msg, type StoryPayload } from "./RepairStoryWorkspace";

type Props = { params: Promise<{ storyId: string }> };

export default async function RepairStoryPage({ params }: Props) {
  const session = await getSession();
  const { storyId } = await params;

  if (!session) {
    redirect("/login?next=" + encodeURIComponent(`/repair-stories/${storyId}`));
  }

  const story = await prisma.repairStory.findUnique({
    where: { id: storyId },
    include: {
      listing: { select: { id: true, title: true, authorId: true } },
      repairer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!story) {
    notFound();
  }

  const viewerIsAuthor = story.listing.authorId === session.userId;
  const viewerIsRepairer = story.repairerUserId === session.userId;
  if (!viewerIsAuthor && !viewerIsRepairer) {
    redirect("/listings");
  }

  const rawMessages = await prisma.repairStoryMessage.findMany({
    where: { repairStoryId: storyId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, email: true } } },
  });

  const initialMessages: Msg[] = rawMessages.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender,
  }));

  const initialStory: StoryPayload = {
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
  };

  return (
    <RepairStoryWorkspace
      initialStory={initialStory}
      initialMessages={initialMessages}
      viewerIsAuthor={viewerIsAuthor}
      viewerIsRepairer={viewerIsRepairer}
    />
  );
}
