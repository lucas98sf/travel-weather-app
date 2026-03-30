export interface LocationLabelSource {
  country: string;
  name: string;
  region: string | null | undefined;
}

export function formatLocationLabel(location: LocationLabelSource): string {
  const primaryName = location.name
    .split(",")
    .map((segment) => segment.trim())
    .find(Boolean);

  return [primaryName ?? location.name, location.region, location.country]
    .filter(Boolean)
    .join(", ");
}

export function dedupeLocationsByLabel<T extends LocationLabelSource>(
  locations: readonly T[],
): T[] {
  const seen = new Set<string>();

  return locations.filter((location) => {
    const key = formatLocationLabel(location).trim().toLocaleLowerCase("en-US");

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
