export { Activity } from "./types.ts";
import { normalizeLocale } from "../../lib/locale.ts";
import { Activity } from "./types.ts";
import type { ActivityFactor, ActivityRecommendation, DailyWeather } from "./types.ts";

export type {
  ActivityFactor,
  ActivityRecommendation,
  DailyActivitySummary,
  DailyScore,
  DailyWeather,
  TravelReport,
} from "./types.ts";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toScore(value: number): number {
  return Math.round(clamp(value, 0, 100));
}

function capitalize(value: string): string {
  return value.length > 0 ? `${value[0]!.toUpperCase()}${value.slice(1)}` : value;
}

function getRankingCopy(localeInput: string | undefined) {
  const locale = normalizeLocale(localeInput);

  if (locale === "pt-BR") {
    return {
      activityLabels: {
        [Activity.INDOOR_SIGHTSEEING]: "Passeios em locais fechados",
        [Activity.OUTDOOR_SIGHTSEEING]: "Passeios ao ar livre",
        [Activity.SKIING]: "Esqui",
        [Activity.SURFING]: "Surfe",
      },
      factorLabels: {
        feelsLike: "Sensação térmica",
        precipitation: "Precipitação",
        rainChance: "Chance de chuva",
        snowfall: "Neve",
        sunshine: "Sol",
        tempMin: "Temperatura mínima",
        waveHeight: "Altura das ondas",
        wavePeriod: "Período das ondas",
        wind: "Velocidade do vento",
      },
      scoreLabels: {
        excellent: "excelente",
        limited: "limitado",
        mixed: "misto",
        strong: "forte",
      },
      summaryTemplate: (activityLabel: string, scoreLabel: string, simple = false) =>
        simple ? capitalize(scoreLabel) : `${activityLabel} está ${scoreLabel} essa semana.`,
    };
  }

  return {
    activityLabels: {
      [Activity.INDOOR_SIGHTSEEING]: "Indoor sightseeing",
      [Activity.OUTDOOR_SIGHTSEEING]: "Outdoor sightseeing",
      [Activity.SKIING]: "Skiing",
      [Activity.SURFING]: "Surfing",
    },
    factorLabels: {
      feelsLike: "Feels-like high",
      precipitation: "Precipitation",
      rainChance: "Rain chance",
      snowfall: "Snowfall",
      sunshine: "Sunshine",
      tempMin: "Low temperature",
      waveHeight: "Wave height",
      wavePeriod: "Wave period",
      wind: "Wind speed",
    },
    scoreLabels: {
      excellent: "excellent",
      limited: "limited",
      mixed: "mixed",
      strong: "strong",
    },
    summaryTemplate: (activityLabel: string, scoreLabel: string, simple = false) =>
      simple ? capitalize(scoreLabel) : `${activityLabel} looks ${scoreLabel} over the next week.`,
  };
}

function describeScore(score: number, localeInput: string | undefined): string {
  const labels = getRankingCopy(localeInput).scoreLabels;

  if (score >= 78) return labels.excellent;
  if (score >= 62) return labels.strong;
  if (score >= 46) return labels.mixed;
  return labels.limited;
}

function weightedWeeklyScore(scores: number[]): number {
  const sorted = [...scores].sort((left, right) => right - left);
  const topDays = sorted.slice(0, 3);
  return toScore(average(topDays) * 0.65 + average(scores) * 0.35);
}

function getActivityLabel(activity: Activity, localeInput: string | undefined): string {
  return getRankingCopy(localeInput).activityLabels[activity];
}

function buildFactor(
  key: string,
  label: string,
  impact: ActivityFactor["impact"],
  value: number,
  unit?: string,
): ActivityFactor {
  return {
    key,
    label,
    impact,
    value: Math.round(value * 10) / 10,
    unit: unit ?? null,
  };
}

function buildRecommendation(
  activity: Activity,
  days: DailyWeather[],
  scorer: (
    day: DailyWeather,
    localeInput: string | undefined,
  ) => { score: number; factors: ActivityFactor[] },
  localeInput: string | undefined,
  note: string | null = null,
): ActivityRecommendation {
  type ScoredDay = ActivityRecommendation["dailyScores"][number] & {
    factors: ActivityFactor[];
  };

  const dailyScores: ScoredDay[] = days.map((day) => {
    const result = scorer(day, localeInput);
    return {
      date: day.date,
      score: result.score,
      label: describeScore(result.score, localeInput),
      factors: result.factors,
    };
  });

  const bestDay = dailyScores.reduce(
    (best, current) => (current.score > best.score ? current : best),
    dailyScores[0],
  );

  return {
    activity,
    score: weightedWeeklyScore(dailyScores.map((item) => item.score)),
    rank: 0,
    bestDay: bestDay.date,
    summary: getRankingCopy(localeInput).summaryTemplate(
      getActivityLabel(activity, localeInput),
      bestDay.label,
    ),
    note,
    factors: bestDay.factors,
    dailyScores: dailyScores.map(({ date, score, label, factors }) => ({
      date,
      score,
      label,
      factors,
    })),
  };
}

function skiingScore(day: DailyWeather, localeInput: string | undefined) {
  const copy = getRankingCopy(localeInput);
  const hasNoSnowAndStaysAboveFreezing = day.snowfallSum === 0 && day.temperatureMin > 0;
  const coldBoost = clamp((2 - day.temperatureMax) * 7, 0, 28);
  const freezeBoost = clamp((0 - day.temperatureMin) * 3.4, 0, 24);
  const snowfallBoost = clamp(day.snowfallSum * 5.2, 0, 34);
  const rainPenalty = clamp(day.precipitationSum * 2.6, 0, 18);
  const thawPenalty = clamp((day.apparentTemperatureMax - 3) * 5, 0, 16);
  const score = hasNoSnowAndStaysAboveFreezing
    ? 0
    : toScore(24 + coldBoost + freezeBoost + snowfallBoost - rainPenalty - thawPenalty);

  return {
    score,
    factors: [
      buildFactor(
        "snowfall",
        copy.factorLabels.snowfall,
        day.snowfallSum >= 1 ? "POSITIVE" : "NEUTRAL",
        day.snowfallSum,
        "cm",
      ),
      buildFactor(
        "tempMin",
        copy.factorLabels.tempMin,
        day.temperatureMin <= -2 ? "POSITIVE" : "NEGATIVE",
        day.temperatureMin,
        "C",
      ),
      buildFactor(
        "precipitation",
        copy.factorLabels.precipitation,
        day.precipitationSum <= 2 ? "NEUTRAL" : "NEGATIVE",
        day.precipitationSum,
        "mm",
      ),
    ],
  };
}

function surfingScore(day: DailyWeather, localeInput: string | undefined) {
  const copy = getRankingCopy(localeInput);
  const waveHeight = day.waveHeightMax ?? 0;
  const wavePeriod = day.wavePeriodAverage ?? 0;
  const waveHeightFit = clamp(30 - Math.abs(waveHeight - 1.8) * 20, 0, 30);
  const wavePeriodFit = clamp((wavePeriod - 6) * 4.5, 0, 24);
  const windPenalty = clamp((day.windSpeedMax - 22) * 1.8, 0, 18);
  const rainPenalty = clamp(day.precipitationSum * 1.5, 0, 14);
  const temperatureBoost = clamp((day.apparentTemperatureMax - 8) * 2.2, 0, 16);
  const score = toScore(
    18 + waveHeightFit + wavePeriodFit + temperatureBoost - windPenalty - rainPenalty,
  );

  return {
    score,
    factors: [
      buildFactor(
        "waveHeight",
        copy.factorLabels.waveHeight,
        waveHeight >= 1 && waveHeight <= 2.6 ? "POSITIVE" : "NEGATIVE",
        waveHeight,
        "m",
      ),
      buildFactor(
        "wavePeriod",
        copy.factorLabels.wavePeriod,
        wavePeriod >= 8 ? "POSITIVE" : "NEUTRAL",
        wavePeriod,
        "s",
      ),
      buildFactor(
        "wind",
        copy.factorLabels.wind,
        day.windSpeedMax <= 24 ? "NEUTRAL" : "NEGATIVE",
        day.windSpeedMax,
        "km/h",
      ),
    ],
  };
}

function outdoorSightseeingScore(day: DailyWeather, localeInput: string | undefined) {
  const copy = getRankingCopy(localeInput);
  const temperatureFit = clamp(34 - Math.abs(day.apparentTemperatureMax - 21) * 2.6, 0, 34);
  const sunBoost = clamp(day.sunshineHours * 3.2, 0, 24);
  const rainPenalty = clamp(
    day.precipitationProbabilityMax * 0.22 + day.precipitationSum * 1.3,
    0,
    28,
  );
  const windPenalty = clamp((day.windSpeedMax - 18) * 1.9, 0, 16);
  const score = toScore(28 + temperatureFit + sunBoost - rainPenalty - windPenalty);

  return {
    score,
    factors: [
      buildFactor(
        "feelsLike",
        copy.factorLabels.feelsLike,
        day.apparentTemperatureMax >= 15 && day.apparentTemperatureMax <= 26
          ? "POSITIVE"
          : "NEUTRAL",
        day.apparentTemperatureMax,
        "C",
      ),
      buildFactor(
        "sunshine",
        copy.factorLabels.sunshine,
        day.sunshineHours >= 4 ? "POSITIVE" : "NEUTRAL",
        day.sunshineHours,
        "h",
      ),
      buildFactor(
        "rainChance",
        copy.factorLabels.rainChance,
        day.precipitationProbabilityMax <= 35 ? "POSITIVE" : "NEGATIVE",
        day.precipitationProbabilityMax,
        "%",
      ),
    ],
  };
}

function indoorSightseeingScore(day: DailyWeather, localeInput: string | undefined) {
  const copy = getRankingCopy(localeInput);
  const wetDayBoost = clamp(
    day.precipitationProbabilityMax * 0.26 + day.precipitationSum * 1.4,
    0,
    30,
  );
  const discomfortBoost = clamp(Math.abs(day.apparentTemperatureMax - 20) * 2.1, 0, 24);
  const windBoost = clamp((day.windSpeedMax - 18) * 1.5, 0, 12);
  const severePenalty = day.windSpeedMax > 55 || day.precipitationSum > 30 ? 14 : 0;
  const sunshinePenalty = clamp(day.sunshineHours * 2.1, 0, 16);
  const score = toScore(
    30 + wetDayBoost + discomfortBoost + windBoost - sunshinePenalty - severePenalty,
  );

  return {
    score,
    factors: [
      buildFactor(
        "rainChance",
        copy.factorLabels.rainChance,
        day.precipitationProbabilityMax >= 45 ? "POSITIVE" : "NEUTRAL",
        day.precipitationProbabilityMax,
        "%",
      ),
      buildFactor(
        "sunshine",
        copy.factorLabels.sunshine,
        day.sunshineHours <= 3 ? "POSITIVE" : "NEGATIVE",
        day.sunshineHours,
        "h",
      ),
      buildFactor(
        "wind",
        copy.factorLabels.wind,
        day.windSpeedMax >= 20 ? "POSITIVE" : "NEUTRAL",
        day.windSpeedMax,
        "km/h",
      ),
    ],
  };
}

export function rankActivities(
  days: DailyWeather[],
  localeInput: string | undefined = "en",
): ActivityRecommendation[] {
  const recommendations = [
    buildRecommendation(Activity.SKIING, days, skiingScore, localeInput),
    buildRecommendation(Activity.SURFING, days, surfingScore, localeInput),
    buildRecommendation(Activity.OUTDOOR_SIGHTSEEING, days, outdoorSightseeingScore, localeInput),
    buildRecommendation(Activity.INDOOR_SIGHTSEEING, days, indoorSightseeingScore, localeInput),
  ];

  return recommendations
    .sort((left, right) => right.score - left.score)
    .map((recommendation, index) => ({
      ...recommendation,
      rank: index + 1,
      summary: getRankingCopy(localeInput).summaryTemplate(
        getActivityLabel(recommendation.activity, localeInput),
        describeScore(recommendation.score, localeInput),
      ),
    }));
}
