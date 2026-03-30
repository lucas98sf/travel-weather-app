import { normalizeLocale } from "../../lib/locale.ts";
import {
  decodeLocationId,
  fetchDailyForecast,
  fetchDailyMarineForecast,
  localizeLocation,
  type LocationOption,
  type MarineDailyForecast,
} from "../../integrations/open-meteo.ts";
import { rankActivities } from "./ranking.ts";
import { Activity } from "./types.ts";
import type {
  ActivityRecommendation,
  DailyActivitySummary,
  TravelReport,
  DailyWeather,
} from "./types.ts";

export interface TravelActivityReport extends TravelReport {
  location: LocationOption;
}

function formatLocationLabel(location: Pick<LocationOption, "country" | "name" | "region">) {
  return [location.name, location.region, location.country].filter(Boolean).join(", ");
}

function isSameLocation(left: LocationOption, right: LocationOption) {
  return (
    left.name.toLowerCase() === right.name.toLowerCase() &&
    (left.region ?? "").toLowerCase() === (right.region ?? "").toLowerCase() &&
    left.country.toLowerCase() === right.country.toLowerCase()
  );
}

function toDailyWeather(
  location: LocationOption,
  forecast: Awaited<ReturnType<typeof fetchDailyForecast>>,
  marineByDate: Map<string, MarineDailyForecast>,
): DailyWeather[] {
  return forecast.map((day) => {
    const marine = marineByDate.get(day.date);
    return {
      date: day.date,
      timezone: location.timezone,
      temperatureMax: day.temperatureMax,
      temperatureMin: day.temperatureMin,
      apparentTemperatureMax: day.apparentTemperatureMax,
      apparentTemperatureMin: day.apparentTemperatureMin,
      precipitationSum: day.precipitationSum,
      precipitationProbabilityMax: day.precipitationProbabilityMax,
      snowfallSum: day.snowfallSum,
      sunshineHours: Math.round((day.sunshineDurationSeconds / 3600) * 10) / 10,
      windSpeedMax: day.windSpeedMax,
      weatherCode: day.weatherCode,
      waveHeightMax: marine?.waveHeightMax ?? null,
      wavePeriodAverage: marine?.wavePeriodAverage ?? null,
    };
  });
}

function toDailySummaries(recommendations: ActivityRecommendation[]): DailyActivitySummary[] {
  return recommendations.flatMap((recommendation) =>
    recommendation.dailyScores.map((daily) => ({
      date: daily.date,
      activity: recommendation.activity,
      score: daily.score,
      label: daily.label,
      factors: daily.factors,
    })),
  );
}

export async function buildTravelReport(
  locationId: string,
  localeInput: string | undefined,
): Promise<TravelActivityReport> {
  const locale = normalizeLocale(localeInput);
  const location = decodeLocationId(locationId);
  const [localizedLocation, forecast, marineForecast] = await Promise.all([
    localizeLocation(location, locale).catch(() => location),
    fetchDailyForecast(location),
    fetchDailyMarineForecast(location, locale).catch(() => ({
      byDate: new Map<string, MarineDailyForecast>(),
      coastalLocation: null,
    })),
  ]);

  const dailyWeather = toDailyWeather(location, forecast, marineForecast.byDate);
  const activities = rankActivities(dailyWeather, locale).map((activity) => {
    if (
      activity.activity === Activity.SURFING &&
      marineForecast.coastalLocation &&
      !isSameLocation(location, marineForecast.coastalLocation)
    ) {
      return {
        ...activity,
        note:
          locale === "pt-BR"
            ? `Esta cidade não fica no litoral, então a pontuação de surfe usa dados marítimos da cidade costeira mais próxima: ${formatLocationLabel(marineForecast.coastalLocation)}.`
            : `This city is not on the coast, so the surfing score uses marine data from the nearest coastal city: ${formatLocationLabel(marineForecast.coastalLocation)}.`,
      };
    }

    return activity;
  });

  return {
    location: localizedLocation,
    generatedAt: new Date().toISOString(),
    activities,
    dailySummaries: toDailySummaries(activities),
  };
}
