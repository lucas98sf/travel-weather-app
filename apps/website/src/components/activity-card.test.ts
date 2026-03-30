import { expect, test } from "vite-plus/test";
import { formatFactorForLocale } from "../lib/temperature.js";

test("skiing metrics stay visible as ordinary factors", () => {
  expect(formatFactorForLocale({ value: 0, unit: "cm" }, "pt-BR")).toEqual({
    value: 0,
    unit: "cm",
  });
});
