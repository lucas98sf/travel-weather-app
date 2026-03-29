import { expect, test } from "vite-plus/test";
import { shouldHideRecommendationCard } from "./activity-card.js";

test("hides skiing when the best available day is still warm and snowless", () => {
  expect(
    shouldHideRecommendationCard("SKIING", [
      { key: "snowfall", value: 0 },
      { key: "tempMin", value: 7 },
    ]),
  ).toBe(true);
});

test("keeps skiing visible when there is cold weather or snowfall", () => {
  expect(
    shouldHideRecommendationCard("SKIING", [
      { key: "snowfall", value: 3 },
      { key: "tempMin", value: -4 },
    ]),
  ).toBe(false);

  expect(
    shouldHideRecommendationCard("SKIING", [
      { key: "snowfall", value: 0 },
      { key: "tempMin", value: -2 },
    ]),
  ).toBe(false);
});

test("never hides non-skiing recommendations", () => {
  expect(
    shouldHideRecommendationCard("SURFING", [
      { key: "tempMin", value: 20 },
      { key: "snowfall", value: 0 },
    ]),
  ).toBe(false);
});
