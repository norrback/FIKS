import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

function buildLocationName(addr: NominatimResult["address"]): string {
  if (!addr) return "";
  const place = addr.village || addr.town || addr.city || addr.municipality || addr.county || "";
  const region = addr.state || "";
  const country = addr.country || "";
  return [place, region, country].filter(Boolean).join(", ");
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required (min 2 chars)." },
      { status: 400 },
    );
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "FIKS-App/1.0 (repair marketplace)" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Geocoding service unavailable." },
      { status: 502 },
    );
  }

  const data: NominatimResult[] = await res.json();
  if (!data.length) {
    return NextResponse.json({ lat: null, lng: null, label: null, locationName: null, postalCode: null });
  }

  const result = data[0];
  const locationName = buildLocationName(result.address);
  const postalCode = result.address?.postcode ?? null;

  return NextResponse.json({
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    label: result.display_name,
    locationName,
    postalCode,
  });
}
