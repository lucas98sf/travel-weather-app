import type { AppLocale } from "./i18n.js";

export type MeasurementSystem = "metric" | "imperial";

export interface DisplayFactor {
  value: number;
  unit: string | null | undefined;
}

function isCelsiusUnit(unit: DisplayFactor["unit"]) {
  return unit === "C" || unit === "°C";
}

function isMeterUnit(unit: DisplayFactor["unit"]) {
  return unit === "m";
}

function isWindSpeedUnit(unit: DisplayFactor["unit"]) {
  return unit === "km/h";
}

function roundTemperature(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundMeasurement(value: number): number {
  return Math.round(value * 10) / 10;
}

export function toFahrenheit(celsius: number): number {
  return roundTemperature((celsius * 9) / 5 + 32);
}

export function toMilesPerHour(kilometersPerHour: number): number {
  return roundMeasurement(kilometersPerHour * 0.621371);
}

export function toFeet(meters: number): number {
  return roundMeasurement(meters * 3.28084);
}

export function getMeasurementSystem(locale: AppLocale): MeasurementSystem {
  return locale === "en" ? "imperial" : "metric";
}

export function formatFactorForLocale(factor: DisplayFactor, locale: AppLocale): DisplayFactor {
  const measurementSystem = getMeasurementSystem(locale);

  if (isCelsiusUnit(factor.unit)) {
    if (measurementSystem === "metric") {
      return {
        value: factor.value,
        unit: "°C",
      };
    }

    return {
      value: toFahrenheit(factor.value),
      unit: "°F",
    };
  }

  if (isWindSpeedUnit(factor.unit) && measurementSystem === "imperial") {
    return {
      value: toMilesPerHour(factor.value),
      unit: "mph",
    };
  }

  if (isMeterUnit(factor.unit) && measurementSystem === "imperial") {
    return {
      value: toFeet(factor.value),
      unit: "ft",
    };
  }

  return factor;
}
