import { expect, test } from "vite-plus/test";
import { Activity, rankActivities, type DailyWeather } from "../src/domain/travel/ranking.js";

function buildDay(overrides: Partial<DailyWeather>): DailyWeather {
  return {
    date: "2026-03-28",
    timezone: "UTC",
    temperatureMax: 18,
    temperatureMin: 8,
    apparentTemperatureMax: 18,
    apparentTemperatureMin: 8,
    precipitationSum: 1,
    precipitationProbabilityMax: 20,
    snowfallSum: 0,
    sunshineHours: 6,
    windSpeedMax: 14,
    weatherCode: 1,
    waveHeightMax: 1.8,
    wavePeriodAverage: 9.5,
    ...overrides,
  };
}

test("skiing improves with cold snowy days", () => {
  const coldWeek = Array.from({ length: 7 }, (_, index) =>
    buildDay({
      date: `2026-03-${String(28 + index).padStart(2, "0")}`,
      temperatureMax: -4,
      temperatureMin: -10,
      apparentTemperatureMax: -7,
      snowfallSum: 6,
      precipitationSum: 2,
      precipitationProbabilityMax: 60,
    }),
  );

  const warmWeek = Array.from({ length: 7 }, (_, index) =>
    buildDay({
      date: `2026-03-${String(28 + index).padStart(2, "0")}`,
      temperatureMax: 14,
      temperatureMin: 7,
      apparentTemperatureMax: 16,
      snowfallSum: 0,
      precipitationSum: 5,
      precipitationProbabilityMax: 75,
    }),
  );

  const skiingCold = rankActivities(coldWeek).find((item) => item.activity === Activity.SKIING)!;
  const skiingWarm = rankActivities(warmWeek).find((item) => item.activity === Activity.SKIING)!;

  expect(skiingCold.score).toBeGreaterThan(skiingWarm.score);
});

test("skiing scores zero on warm snowless days", () => {
  const warmSnowlessWeek = rankActivities(
    Array.from({ length: 7 }, (_, index) =>
      buildDay({
        date: `2026-03-${String(28 + index).padStart(2, "0")}`,
        temperatureMax: 17,
        temperatureMin: 7,
        apparentTemperatureMax: 18,
        snowfallSum: 0,
        precipitationSum: 0,
      }),
    ),
  ).find((item) => item.activity === Activity.SKIING)!;

  expect(warmSnowlessWeek.score).toBe(0);
  expect(warmSnowlessWeek.dailyScores.every((day) => day.score === 0)).toBe(true);
});

test("outdoor sightseeing prefers mild, dry, sunny weather", () => {
  const pleasant = rankActivities(
    Array.from({ length: 7 }, (_, index) =>
      buildDay({
        date: `2026-03-${String(28 + index).padStart(2, "0")}`,
        apparentTemperatureMax: 22,
        precipitationSum: 0,
        precipitationProbabilityMax: 10,
        sunshineHours: 8,
        windSpeedMax: 10,
      }),
    ),
  ).find((item) => item.activity === Activity.OUTDOOR_SIGHTSEEING)!;

  const unpleasant = rankActivities(
    Array.from({ length: 7 }, (_, index) =>
      buildDay({
        date: `2026-03-${String(28 + index).padStart(2, "0")}`,
        apparentTemperatureMax: 33,
        precipitationSum: 12,
        precipitationProbabilityMax: 90,
        sunshineHours: 0.8,
        windSpeedMax: 34,
      }),
    ),
  ).find((item) => item.activity === Activity.OUTDOOR_SIGHTSEEING)!;

  expect(pleasant.score).toBeGreaterThan(unpleasant.score);
});

test("surfing tolerates missing marine data without throwing", () => {
  const results = rankActivities(
    Array.from({ length: 7 }, (_, index) =>
      buildDay({
        date: `2026-03-${String(28 + index).padStart(2, "0")}`,
        waveHeightMax: null,
        wavePeriodAverage: null,
      }),
    ),
  );

  const surfing = results.find((item) => item.activity === Activity.SURFING)!;
  expect(surfing.score).toBeGreaterThanOrEqual(0);
  expect(surfing.note).toBeNull();
});

test("can localize ranking summaries and factor labels to portuguese", () => {
  const skiing = rankActivities([buildDay({ snowfallSum: 5, temperatureMin: -8 })], "pt-BR").find(
    (item) => item.activity === Activity.SKIING,
  )!;

  expect(skiing.summary).toContain("parece");
  expect(skiing.factors[0]?.label).toBe("Neve");
});
