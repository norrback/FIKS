/** Build an OpenStreetMap embed URL with optional marker (same pattern as create-listing). */
export function repairerOsmEmbedSrc(latitude: number, longitude: number): string {
  const lat = latitude;
  const lon = longitude;
  const d = 0.025;
  const minLon = lon - d;
  const minLat = lat - d;
  const maxLon = lon + d;
  const maxLat = lat + d;
  const bbox = `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
  const marker = `${lat}%2C${lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

export const DEFAULT_SERVICE_MAP = {
  label: "Helsinki",
  latitude: 60.1699,
  longitude: 24.9384,
} as const;
