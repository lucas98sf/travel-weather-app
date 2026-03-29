import { GraphQLSchema } from "graphql";
import { normalizeLocale } from "../locale.ts";
import type { LocationOption } from "../openMeteo.ts";
import { localizeLocation, searchDestinations } from "../openMeteo.ts";
import type {
  ActivityFactor as ActivityFactorModel,
  ActivityRecommendation as ActivityRecommendationModel,
  DailyActivitySummary as DailyActivitySummaryModel,
  TravelReport as TravelReportModel,
} from "../types.ts";
import { decodeLocationId, fetchDailyForecast, fetchDailyMarineForecast } from "../openMeteo.ts";
import type { MarineDailyForecast } from "../openMeteo.ts";
import { rankActivities } from "../ranking.ts";
import { Activity, FactorImpact } from "../types.ts";

import SchemaBuilder from "@pothos/core";

export interface GraphQLContext {}

export const builder = new SchemaBuilder<{ Context: GraphQLContext }>({});

function enumValues<const T extends Record<string, string>>(values: T) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }])) as {
    [K in keyof T]: { value: T[K] };
  };
}

const ActivityGql = builder.enumType("Activity", {
  values: enumValues(Activity),
});

const FactorImpactGql = builder.enumType("FactorImpact", {
  values: enumValues(FactorImpact),
});

const LocationOptionRef = builder.objectRef<LocationOption>("LocationOption");
LocationOptionRef.implement({
  fields: (t) => ({
    id: t.exposeString("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    region: t.exposeString("region", { nullable: true }),
    country: t.exposeString("country", { nullable: false }),
    latitude: t.exposeFloat("latitude", { nullable: false }),
    longitude: t.exposeFloat("longitude", { nullable: false }),
    timezone: t.exposeString("timezone", { nullable: false }),
  }),
});

const ActivityFactorRef = builder.objectRef<ActivityFactorModel>("ActivityFactor");
ActivityFactorRef.implement({
  fields: (t) => ({
    key: t.exposeString("key", { nullable: false }),
    label: t.exposeString("label", { nullable: false }),
    impact: t.field({
      type: FactorImpactGql,
      nullable: false,
      resolve: (parent) => parent.impact,
    }),
    value: t.exposeFloat("value", { nullable: false }),
    unit: t.exposeString("unit", { nullable: true }),
  }),
});

const DailyActivitySummaryRef =
  builder.objectRef<DailyActivitySummaryModel>("DailyActivitySummary");
DailyActivitySummaryRef.implement({
  fields: (t) => ({
    date: t.exposeString("date", { nullable: false }),
    activity: t.field({
      type: ActivityGql,
      nullable: false,
      resolve: (parent) => parent.activity,
    }),
    score: t.exposeInt("score", { nullable: false }),
    label: t.exposeString("label", { nullable: false }),
    factors: t.field({
      type: [ActivityFactorRef],
      nullable: { list: false, items: false },
      resolve: (parent) => parent.factors,
    }),
  }),
});

const ActivityRecommendationRef =
  builder.objectRef<ActivityRecommendationModel>("ActivityRecommendation");
ActivityRecommendationRef.implement({
  fields: (t) => ({
    activity: t.field({
      type: ActivityGql,
      nullable: false,
      resolve: (parent) => parent.activity,
    }),
    score: t.exposeInt("score", { nullable: false }),
    rank: t.exposeInt("rank", { nullable: false }),
    bestDay: t.exposeString("bestDay", { nullable: false }),
    summary: t.exposeString("summary", { nullable: false }),
    note: t.exposeString("note", { nullable: true }),
    factors: t.field({
      type: [ActivityFactorRef],
      nullable: { list: false, items: false },
      resolve: (parent) => parent.factors,
    }),
  }),
});

export interface TravelActivityReport extends TravelReportModel {
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

const TravelActivityReportRef = builder.objectRef<TravelActivityReport>("TravelActivityReport");
TravelActivityReportRef.implement({
  fields: (t) => ({
    location: t.field({
      type: LocationOptionRef,
      nullable: false,
      resolve: (parent) => parent.location,
    }),
    generatedAt: t.exposeString("generatedAt", { nullable: false }),
    activities: t.field({
      type: [ActivityRecommendationRef],
      nullable: { list: false, items: false },
      resolve: (parent) => parent.activities,
    }),
    dailySummaries: t.field({
      type: [DailyActivitySummaryRef],
      nullable: { list: false, items: false },
      resolve: (parent) => parent.dailySummaries,
    }),
  }),
});

function toDailyWeather(
  location: LocationOption,
  forecast: Awaited<ReturnType<typeof fetchDailyForecast>>,
  marineByDate: Map<string, MarineDailyForecast>,
) {
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

function toDailySummaries(
  recommendations: ActivityRecommendationModel[],
): DailyActivitySummaryModel[] {
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

async function buildTravelReport(
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
            ? `Esta cidade não fica no litoral, então o surfe usa condições marítimas próximas de ${formatLocationLabel(marineForecast.coastalLocation)}.`
            : `This city is not on the coast, so surfing uses marine conditions near ${formatLocationLabel(marineForecast.coastalLocation)}.`,
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

builder.queryType({
  fields: (t) => ({
    searchDestinations: t.field({
      type: [LocationOptionRef],
      args: {
        locale: t.arg.string({ required: true }),
        query: t.arg.string({ required: true }),
      },
      nullable: { list: false, items: false },
      resolve: async (_root, args) => searchDestinations(args.query, args.locale),
    }),
    travelActivityRanking: t.field({
      type: TravelActivityReportRef,
      args: {
        locale: t.arg.string({ required: true }),
        locationId: t.arg.string({ required: true }),
      },
      nullable: false,
      resolve: async (_root, args) => buildTravelReport(args.locationId, args.locale),
    }),
  }),
});

export const schema: GraphQLSchema = builder.toSchema({});
