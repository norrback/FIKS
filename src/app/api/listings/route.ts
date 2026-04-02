import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMainCategory, isValidSubCategory } from "@/lib/listingCategories";
import { normalizePhotoUrls, photoUrlsToJson } from "@/lib/listingPhotos";

export const runtime = "nodejs";

type CreateListingBody = {
  title?: string;
  itemName?: string;
  description?: string;
  location?: string;
  postalCode?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  mainCategory?: string;
  subCategory?: string;
  photoUrls?: string[];
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in to post a listing." }, { status: 401 });
  }

  let body: CreateListingBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = String(body.title ?? body.itemName ?? "").trim();
  const description = String(body.description ?? "").trim();
  const postalCode = String(body.postalCode ?? "").trim();
  const locationName = String(body.locationName ?? "").trim();
  const locationRaw = String(body.location ?? "").trim();
  const location = locationRaw.length > 0 ? locationRaw : null;
  const latitude = typeof body.latitude === "number" && isFinite(body.latitude) ? body.latitude : null;
  const longitude = typeof body.longitude === "number" && isFinite(body.longitude) ? body.longitude : null;
  const mainCategory = String(body.mainCategory ?? "").trim().toUpperCase();
  const subCategory = String(body.subCategory ?? "").trim();
  const photoUrls = Array.isArray(body.photoUrls)
    ? normalizePhotoUrls(body.photoUrls.filter((x): x is string => typeof x === "string").map((s) => s.trim()))
    : [];

  if (!title || !description) {
    return NextResponse.json(
      { error: "Item name and description are required." },
      { status: 400 },
    );
  }
  if (!isMainCategory(mainCategory)) {
    return NextResponse.json(
      { error: "Please select a valid main category." },
      { status: 400 },
    );
  }
  if (!isValidSubCategory(mainCategory, subCategory)) {
    return NextResponse.json(
      { error: "Please select a valid subcategory for the chosen main category." },
      { status: 400 },
    );
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        postalCode,
        locationName,
        location,
        latitude,
        longitude,
        mainCategory,
        subCategory,
        photoUrlsJson: photoUrlsToJson(photoUrls),
        authorId: session.userId,
      },
    });
    return NextResponse.json({ id: listing.id });
  } catch (err) {
    console.error("[api/listings] create", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Could not save your listing. Try again.",
        ...(process.env.NODE_ENV === "development" ? { detail: message } : {}),
      },
      { status: 503 },
    );
  }
}
