import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMainCategory, isValidSubCategory } from "@/lib/listingCategories";
import { normalizePhotoUrls, photoUrlsToJson } from "@/lib/listingPhotos";

export const runtime = "nodejs";

type PatchBody = {
  title?: unknown;
  description?: unknown;
  location?: unknown;
  mainCategory?: unknown;
  subCategory?: unknown;
  photoUrls?: unknown;
  status?: unknown;
};

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.listing.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!existing || existing.authorId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const location =
    body.location === null
      ? null
      : typeof body.location === "string"
        ? body.location.trim() || null
        : undefined;
  const mainCategory =
    typeof body.mainCategory === "string" ? body.mainCategory.trim().toUpperCase() : undefined;
  const subCategory = typeof body.subCategory === "string" ? body.subCategory.trim() : undefined;
  const photoUrls =
    Array.isArray(body.photoUrls)
      ? normalizePhotoUrls(body.photoUrls.filter((x): x is string => typeof x === "string").map((s) => s.trim()))
      : undefined;
  const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : undefined;

  if (title !== undefined && title.length === 0) {
    return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
  }
  if (description !== undefined && description.length === 0) {
    return NextResponse.json({ error: "Description cannot be empty." }, { status: 400 });
  }

  const nextMainCategory = mainCategory;
  const nextSubCategory = subCategory;
  if (nextMainCategory !== undefined) {
    if (!isMainCategory(nextMainCategory)) {
      return NextResponse.json({ error: "Invalid main category." }, { status: 400 });
    }
    if (!isValidSubCategory(nextMainCategory, nextSubCategory ?? "")) {
      return NextResponse.json({ error: "Invalid subcategory for selected main category." }, { status: 400 });
    }
  } else if (nextSubCategory !== undefined) {
    return NextResponse.json(
      { error: "Cannot update subcategory without main category." },
      { status: 400 },
    );
  }

  if (status !== undefined && status !== "OPEN" && status !== "CLOSED") {
    return NextResponse.json({ error: "Status must be OPEN or CLOSED." }, { status: 400 });
  }

  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(mainCategory !== undefined ? { mainCategory } : {}),
      ...(subCategory !== undefined ? { subCategory } : {}),
      ...(photoUrls !== undefined ? { photoUrlsJson: photoUrlsToJson(photoUrls) } : {}),
      ...(status !== undefined ? { status } : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      status: true,
      mainCategory: true,
      subCategory: true,
      photoUrlsJson: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    location: updated.location,
    status: updated.status,
    mainCategory: updated.mainCategory,
    subCategory: updated.subCategory,
    photoUrlsJson: updated.photoUrlsJson,
    updatedAt: updated.updatedAt.toISOString(),
  });
}
