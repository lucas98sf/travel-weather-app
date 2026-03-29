import { expect, test } from "vite-plus/test";
import { formatFactorForUnit, toFahrenheit } from "./temperature.js";

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
  expect(formatFactorForUnit({ value: -6.8, unit: "C" }, "celsius")).toEqual({
    value: -6.8,
    unit: "°C",
  });
});

test("adds a degree symbol to converted fahrenheit values", () => {
  expect(formatFactorForUnit({ value: 0, unit: "C" }, "fahrenheit")).toEqual({
    value: 32,
    unit: "°F",
  });
});

test("converts values that already include a celsius degree symbol", () => {
  expect(formatFactorForUnit({ value: 10, unit: "°C" }, "fahrenheit")).toEqual({
    value: 50,
    unit: "°F",
  });
});

test("leaves non-temperature factors unchanged", () => {
  expect(formatFactorForUnit({ value: 12, unit: "mm" }, "fahrenheit")).toEqual({
    value: 12,
    unit: "mm",
  });
});
