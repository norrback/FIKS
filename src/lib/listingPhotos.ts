export function parsePhotoUrls(json: string): string[] {
  try {
    const v = JSON.parse(json) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function normalizePhotoUrls(urls: string[]): string[] {
  const unique = new Set<string>();
  for (const raw of urls) {
    if (raw.startsWith("/uploads/") || raw.startsWith("https://")) {
      unique.add(raw);
    }
  }
  return Array.from(unique).slice(0, 10);
}

export function photoUrlsToJson(urls: string[]): string {
  return JSON.stringify(urls);
}
