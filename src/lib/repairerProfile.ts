import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

export function slugifySegment(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "repairer";
}

function randomSuffix(): string {
  return randomBytes(3).toString("hex");
}

export async function uniqueRepairerSlug(baseName: string): Promise<string> {
  const base = slugifySegment(baseName);
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    const existing = await prisma.repairerProfile.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  return `${base}-${randomSuffix()}${randomSuffix()}`;
}

/** Parse comma- or newline-separated expertise from signup / forms */
export function parseExpertiseList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function expertiseToJson(items: string[]): string {
  return JSON.stringify(items);
}

export function expertiseFromJson(json: string): string[] {
  try {
    const v = JSON.parse(json) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim());
  } catch {
    return [];
  }
}

export async function ensureRepairerProfile(userId: string): Promise<{ slug: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });
  if (!user || user.role !== "REPAIRER") return null;

  const existing = await prisma.repairerProfile.findUnique({
    where: { userId },
    select: { slug: true },
  });
  if (existing) return { slug: existing.slug };

  const slug = await uniqueRepairerSlug(user.name ?? "repairer");
  await prisma.repairerProfile.create({
    data: {
      userId,
      slug,
      serviceName: user.name?.trim() || "",
      bio: "",
      serviceDescription: "",
      expertise: expertiseToJson([]),
    },
  });
  return { slug };
}
