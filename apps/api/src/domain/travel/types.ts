export const Activity = {
  SKIING: "SKIING",
  SURFING: "SURFING",
  OUTDOOR_SIGHTSEEING: "OUTDOOR_SIGHTSEEING",
  INDOOR_SIGHTSEEING: "INDOOR_SIGHTSEEING",
} as const;

export type Activity = (typeof Activity)[keyof typeof Activity];

export const FactorImpact = {
  POSITIVE: "POSITIVE",
  NEUTRAL: "NEUTRAL",
  NEGATIVE: "NEGATIVE",
} as const;

export type FactorImpact = (typeof FactorImpact)[keyof typeof FactorImpact];

export type DailyWeather = {
  date: string;
  timezone: string;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  snowfallSum: number;
  sunshineHours: number;
  windSpeedMax: number;
  weatherCode: number;
  waveHeightMax: number | null;
  wavePeriodAverage: number | null;
};

export type ActivityFactor = {
  key: string;
  label: string;
  impact: FactorImpact;
  value: number;
  unit: string | null;
};

export type DailyScore = {
  date: string;
  score: number;
  label: string;
  factors: ActivityFactor[];
};

export type ActivityRecommendation = {
  activity: Activity;
  score: number;
  rank: number;
  bestDay: string;
  summary: string;
  note: string | null;
  factors: ActivityFactor[];
  dailyScores: DailyScore[];
};

export type DailyActivitySummary = {
  date: string;
  activity: Activity;
  score: number;
  label: string;
  factors: ActivityFactor[];
};

export type TravelReport = {
  generatedAt: string;
  activities: ActivityRecommendation[];
  dailySummaries: DailyActivitySummary[];
};
