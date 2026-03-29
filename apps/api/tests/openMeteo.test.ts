import { expect, test } from "vite-plus/test";
import { getOpenMeteoLanguage, normalizeLocale } from "../src/locale.js";
import { decodeLocationId, encodeLocationId, summariseMarineForecast } from "../src/openMeteo.js";

test("location ids round-trip the selected place payload", () => {
  const id = encodeLocationId({
    name: "Montauk",
    region: "New York",
    country: "United States",
    latitude: 41.0359,
    longitude: -71.9545,
    timezone: "America/New_York",
  });

  expect(decodeLocationId(id)).toMatchObject({
    id,
    name: "Montauk",
    region: "New York",
    country: "United States",
  });
});

test("marine forecast summary groups hourly readings into daily maxima and averages", () => {
  const summary = summariseMarineForecast({
    hourly: {
      time: ["2026-03-28T00:00", "2026-03-28T01:00", "2026-03-29T00:00"],
      wave_height: [1.2, 1.8, 0.9],
      wave_period: [9.1, 10.3, 7.2],
    },
  });

  expect(summary).toEqual([
    {
      date: "2026-03-28",
      waveHeightMax: 1.8,
      wavePeriodAverage: 9.7,
    },
    {
      date: "2026-03-29",
      waveHeightMax: 0.9,
      wavePeriodAverage: 7.2,
    },
  ]);
});

test("normalizes app locales for portuguese and english", () => {
  expect(normalizeLocale("pt")).toBe("pt-BR");
  expect(normalizeLocale("pt-BR")).toBe("pt-BR");
  expect(normalizeLocale("en-US")).toBe("en");
  expect(getOpenMeteoLanguage("pt-BR")).toBe("pt");
  expect(getOpenMeteoLanguage("en-US")).toBe("en");
});
