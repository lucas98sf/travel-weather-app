export const appLocales = ["en", "pt-BR"] as const;

export type AppLocale = (typeof appLocales)[number];

export function normalizeLocale(locale: string | null | undefined): AppLocale {
  return locale?.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function getOpenMeteoLanguage(locale: string | null | undefined): "en" | "pt" {
  return normalizeLocale(locale) === "pt-BR" ? "pt" : "en";
}
