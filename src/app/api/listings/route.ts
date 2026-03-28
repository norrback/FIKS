import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in to post a listing." }, { status: 401 });
  }

  let body: { title?: string; itemName?: string; description?: string; location?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = String(body.title ?? body.itemName ?? "").trim();
  const description = String(body.description ?? "").trim();
  const locationRaw = String(body.location ?? "").trim();
  const location = locationRaw.length > 0 ? locationRaw : null;

  if (!title || !description) {
    return NextResponse.json(
      { error: "Item name and description are required." },
      { status: 400 },
    );
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        location,
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
