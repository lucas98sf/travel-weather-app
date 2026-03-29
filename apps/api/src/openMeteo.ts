import { getOpenMeteoLanguage } from "./locale.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const REVERSE_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/reverse";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

export interface LocationOption {
  id: string;
  name: string;
  region: string | null;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  snowfallSum: number;
  sunshineDurationSeconds: number;
  windSpeedMax: number;
  weatherCode: number;
}

export interface MarineDailyForecast {
  date: string;
  waveHeightMax: number | null;
  wavePeriodAverage: number | null;
}

interface GeocodingApiResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
    country: string;
    admin1?: string;
  }>;
}

interface ForecastApiResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    snowfall_sum: number[];
    sunshine_duration: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
  };
}

interface MarineApiResponse {
  latitude?: number;
  longitude?: number;
  hourly: {
    time: string[];
    wave_height: Array<number | null>;
    wave_period: Array<number | null>;
  };
}

export interface MarineForecastResult {
  byDate: Map<string, MarineDailyForecast>;
  coastalLocation: LocationOption | null;
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export function encodeLocationId(location: Omit<LocationOption, "id">): string {
  return Buffer.from(JSON.stringify(location), "utf8").toString("base64url");
}

export function decodeLocationId(id: string): LocationOption {
  const payload = JSON.parse(Buffer.from(id, "base64url").toString("utf8")) as Omit<
    LocationOption,
    "id"
  >;
  return { id, ...payload };
}

export async function searchDestinations(
  query: string,
  locale: string | null | undefined = "en",
): Promise<LocationOption[]> {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", getOpenMeteoLanguage(locale));
  url.searchParams.set("format", "json");

  const response = await fetchJson<GeocodingApiResponse>(url);

  return (response.results ?? []).map((result) => {
    const location = {
      name: result.name,
      region: result.admin1 ?? null,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
    };

    return {
      id: encodeLocationId(location),
      ...location,
    };
  });
}

async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
  locale: string | null | undefined = "en",
): Promise<LocationOption | null> {
  const url = new URL(REVERSE_GEOCODING_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("count", "1");
  url.searchParams.set("language", getOpenMeteoLanguage(locale));
  url.searchParams.set("format", "json");

  const response = await fetchJson<GeocodingApiResponse>(url);
  const result = response.results?.[0];
  if (!result) {
    return null;
  }

  const location = {
    name: result.name,
    region: result.admin1 ?? null,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };

  return {
    id: encodeLocationId(location),
    ...location,
  };
}

export async function fetchDailyForecast(location: LocationOption): Promise<DailyForecast[]> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("timezone", location.timezone);
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "snowfall_sum",
      "sunshine_duration",
      "wind_speed_10m_max",
      "weather_code",
    ].join(","),
  );

  const response = await fetchJson<ForecastApiResponse>(url);
  const { daily } = response;

  return daily.time.map((date, index) => ({
    date,
    temperatureMax: daily.temperature_2m_max[index] ?? 0,
    temperatureMin: daily.temperature_2m_min[index] ?? 0,
    apparentTemperatureMax: daily.apparent_temperature_max[index] ?? 0,
    apparentTemperatureMin: daily.apparent_temperature_min[index] ?? 0,
    precipitationSum: daily.precipitation_sum[index] ?? 0,
    precipitationProbabilityMax: daily.precipitation_probability_max[index] ?? 0,
    snowfallSum: daily.snowfall_sum[index] ?? 0,
    sunshineDurationSeconds: daily.sunshine_duration[index] ?? 0,
    windSpeedMax: daily.wind_speed_10m_max[index] ?? 0,
    weatherCode: daily.weather_code[index] ?? 0,
  }));
}

export function summariseMarineForecast(response: MarineApiResponse): MarineDailyForecast[] {
  const byDay = new Map<
    string,
    {
      maxWaveHeight: number | null;
      wavePeriods: number[];
    }
  >();

  response.hourly.time.forEach((timestamp, index) => {
    const day = timestamp.slice(0, 10);
    const current = byDay.get(day) ?? { maxWaveHeight: null, wavePeriods: [] };
    const waveHeight = response.hourly.wave_height[index];
    const wavePeriod = response.hourly.wave_period[index];

    current.maxWaveHeight =
      waveHeight == null
        ? current.maxWaveHeight
        : Math.max(current.maxWaveHeight ?? waveHeight, waveHeight);
    if (wavePeriod != null) {
      current.wavePeriods.push(wavePeriod);
    }

    byDay.set(day, current);
  });

  return Array.from(byDay.entries()).map(([date, value]) => ({
    date,
    waveHeightMax: value.maxWaveHeight,
    wavePeriodAverage:
      value.wavePeriods.length > 0
        ? value.wavePeriods.reduce((sum, item) => sum + item, 0) / value.wavePeriods.length
        : null,
  }));
}

export async function fetchDailyMarineForecast(
  location: LocationOption,
  locale: string | null | undefined = "en",
): Promise<MarineForecastResult> {
  const url = new URL(MARINE_URL);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("timezone", location.timezone);
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("cell_selection", "sea");
  url.searchParams.set("hourly", ["wave_height", "wave_period"].join(","));

  const response = await fetchJson<MarineApiResponse>(url);
  const summary = summariseMarineForecast(response);
  const coastalLocation =
    response.latitude != null && response.longitude != null
      ? await reverseGeocodeLocation(response.latitude, response.longitude, locale)
      : null;

  return {
    byDate: new Map(summary.map((item) => [item.date, item])),
    coastalLocation,
  };
}

export async function localizeLocation(
  location: LocationOption,
  locale: string | null | undefined = "en",
): Promise<LocationOption> {
  const localizedLocation = await reverseGeocodeLocation(
    location.latitude,
    location.longitude,
    locale,
  );
  return localizedLocation ?? location;
}
