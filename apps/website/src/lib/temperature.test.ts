import { expect, test } from "vite-plus/test";
import {
  formatFactorForLocale,
  getMeasurementSystem,
  toFahrenheit,
  toFeet,
  toMilesPerHour,
} from "./temperature.js";

test("converts zero celsius to fahrenheit", () => {
  expect(toFahrenheit(0)).toBe(32);
});

test("converts negative celsius temperatures correctly", () => {
  expect(toFahrenheit(-10)).toBe(14);
});

test("rounds decimal celsius conversions for badge display", () => {
  expect(toFahrenheit(21.3)).toBe(70.3);
});

test("adds a degree symbol to celsius values", () => {
  expect(formatFactorForLocale({ value: -6.8, unit: "C" }, "pt-BR")).toEqual({
    value: -6.8,
    unit: "°C",
  });
});

test("adds a degree symbol to converted fahrenheit values", () => {
  expect(formatFactorForLocale({ value: 0, unit: "C" }, "en")).toEqual({
    value: 32,
    unit: "°F",
  });
});

test("converts values that already include a celsius degree symbol", () => {
  expect(formatFactorForLocale({ value: 10, unit: "°C" }, "en")).toEqual({
    value: 50,
    unit: "°F",
  });
});

test("converts wind speed to miles per hour for english locale", () => {
  expect(formatFactorForLocale({ value: 24, unit: "km/h" }, "en")).toEqual({
    value: 14.9,
    unit: "mph",
  });
});

test("converts meters to feet for english locale", () => {
  expect(formatFactorForLocale({ value: 1.8, unit: "m" }, "en")).toEqual({
    value: 5.9,
    unit: "ft",
  });
});

test("leaves metric factors unchanged for portuguese locale", () => {
  expect(formatFactorForLocale({ value: 12, unit: "mm" }, "pt-BR")).toEqual({
    value: 12,
    unit: "mm",
  });
});

test("maps supported locales to the expected measurement systems", () => {
  expect(getMeasurementSystem("en")).toBe("imperial");
  expect(getMeasurementSystem("pt-BR")).toBe("metric");
});

test("converts kilometers per hour to miles per hour", () => {
  expect(toMilesPerHour(16)).toBe(9.9);
});

test("converts meters to feet", () => {
  expect(toFeet(2)).toBe(6.6);
});
