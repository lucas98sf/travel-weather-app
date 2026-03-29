export interface LocationLabelSource {
  country: string;
  name: string;
  region: string | null | undefined;
}

export function formatLocationLabel(location: LocationLabelSource): string {
  return [location.name, location.region, location.country].filter(Boolean).join(", ");
}
