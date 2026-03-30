import { GraphQLSchema } from "graphql";
import type { LocationOption } from "../integrations/open-meteo.ts";
import { searchDestinations } from "../integrations/open-meteo.ts";
import { buildTravelReport, type TravelActivityReport } from "../domain/travel/report.ts";
import type {
  ActivityFactor as ActivityFactorModel,
  ActivityRecommendation as ActivityRecommendationModel,
  DailyActivitySummary as DailyActivitySummaryModel,
} from "../domain/travel/types.ts";
import { Activity, FactorImpact } from "../domain/travel/types.ts";

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
