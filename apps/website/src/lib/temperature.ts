export const temperatureUnitOptions = ["celsius", "fahrenheit"] as const;

export type TemperatureUnit = (typeof temperatureUnitOptions)[number];

export interface DisplayFactor {
  value: number;
  unit: string | null | undefined;
}

function isCelsiusUnit(unit: DisplayFactor["unit"]) {
  return unit === "C" || unit === "°C";
}

function roundTemperature(value: number): number {
  return Math.round(value * 10) / 10;
}

export function toFahrenheit(celsius: number): number {
  return roundTemperature((celsius * 9) / 5 + 32);
}

export function formatFactorForUnit(factor: DisplayFactor, unit: TemperatureUnit): DisplayFactor {
  if (isCelsiusUnit(factor.unit)) {
    if (unit === "celsius") {
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

  return factor;
}
