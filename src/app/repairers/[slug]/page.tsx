import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { expertiseFromJson } from "@/lib/repairerProfile";
import RepairerServiceClient from "./RepairerServiceClient";

type Props = { params: Promise<{ slug: string }> };

export default async function RepairerServicePage({ params }: Props) {
  const { slug } = await params;
  const profile = await prisma.repairerProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!profile) {
    notFound();
  }

  const session = await getSession();
  const isOwner = Boolean(session && session.userId === profile.userId);
  const displayName = profile.user.name?.trim() || profile.user.email;

  const initial = {
    slug: profile.slug,
    displayName,
    bio: profile.bio,
    serviceDescription: profile.serviceDescription,
    expertise: expertiseFromJson(profile.expertise),
    completedJobsCount: profile.completedJobsCount,
    ratingSum: profile.ratingSum,
    ratingCount: profile.ratingCount,
  };

  return <RepairerServiceClient initial={initial} isOwner={isOwner} />;
}
