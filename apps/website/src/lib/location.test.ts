import { expect, test } from "vite-plus/test";
import { dedupeLocationsByLabel, formatLocationLabel } from "./location.js";

test("formats a location label from name, region, and country", () => {
  expect(
    formatLocationLabel({
      name: "Florianopolis",
      region: "Santa Catarina",
      country: "Brazil",
    }),
  ).toBe("Florianopolis, Santa Catarina, Brazil");
});

test("deduplicates locations that render the same label", () => {
  const results = dedupeLocationsByLabel([
    {
      id: "1",
      name: "Florianopolis",
      region: "Santa Catarina",
      country: "Brasil",
      latitude: -27.5954,
      longitude: -48.548,
      timezone: "America/Sao_Paulo",
    },
    {
      id: "2",
      name: "Florianopolis",
      region: "Santa Catarina",
      country: "Brasil",
      latitude: -27.5955,
      longitude: -48.5481,
      timezone: "America/Sao_Paulo",
    },
    {
      id: "3",
      name: "Florianopolis",
      region: "Acre",
      country: "Brasil",
      latitude: -8.77,
      longitude: -70.55,
      timezone: "America/Rio_Branco",
    },
  ]);

  expect(results.map((item) => item.id)).toEqual(["1", "3"]);
});
