import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveListingStatus } from "@/lib/repairStoryStatus";
import MyItemsClient, { type MyItem } from "./MyItemsClient";
import styles from "./my-items.module.css";

export default async function MyItemsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=" + encodeURIComponent("/my-items"));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!user || user.role !== "USER") {
    redirect("/listings");
  }

  const items = await prisma.listing.findMany({
    where: { authorId: session.userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      mainCategory: true,
      subCategory: true,
      photoUrlsJson: true,
      createdAt: true,
      updatedAt: true,
      repairStories: { select: { status: true } },
    },
  });

  const initialItems: MyItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    location: item.location,
    status: getEffectiveListingStatus(
      item.status,
      item.repairStories.map((s) => s.status),
    ),
    mainCategory: item.mainCategory,
    subCategory: item.subCategory,
    photoUrlsJson: item.photoUrlsJson,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>My items</h1>
          <p className={styles.subtitle}>Manage your listed items, update details, and add or edit pictures.</p>
        </header>
        <MyItemsClient initialItems={initialItems} />
      </div>
    </div>
  );
}
