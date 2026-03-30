import { expect, test } from "vite-plus/test";
import { getOpenMeteoLanguage, normalizeLocale } from "../src/lib/locale.js";
import {
  decodeLocationId,
  encodeLocationId,
  searchDestinations,
  summariseMarineForecast,
} from "../src/integrations/open-meteo.js";

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

test("deduplicates repeated destination search results from open-meteo", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () =>
    ({
      ok: true,
      json: async () => ({
        results: [
          {
            name: "Florianopolis",
            admin1: "Santa Catarina",
            country: "Brasil",
            latitude: -27.5954,
            longitude: -48.548,
            timezone: "America/Sao_Paulo",
          },
          {
            name: "Florianopolis",
            admin1: "Santa Catarina",
            country: "Brasil",
            latitude: -27.5954,
            longitude: -48.548,
            timezone: "America/Sao_Paulo",
          },
          {
            name: "Florianopolis",
            admin1: "Acre",
            country: "Brasil",
            latitude: -8.77,
            longitude: -70.55,
            timezone: "America/Rio_Branco",
          },
          {
            name: "Florianopolis",
            admin1: "Acre",
            country: "Brasil",
            latitude: -8.77,
            longitude: -70.55,
            timezone: "America/Rio_Branco",
          },
        ],
      }),
    }) as Response;

  try {
    const results = await searchDestinations("florianopolis", "pt-BR");

    expect(results).toHaveLength(2);
    expect(results.map((item) => `${item.name}|${item.region}|${item.country}`)).toEqual([
      "Florianopolis|Santa Catarina|Brasil",
      "Florianopolis|Acre|Brasil",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
