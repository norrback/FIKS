import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, _context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Case-wide messaging has been removed. Use a private repair story thread instead." },
    { status: 410 },
  );
}

export async function POST(_request: NextRequest, _context: Ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    { error: "Case-wide messaging has been removed. Use a private repair story thread instead." },
    { status: 410 },
  );
}
