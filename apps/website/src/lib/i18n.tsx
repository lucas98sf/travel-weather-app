import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const supportedLocales = ["en", "pt-BR"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export const LOCALE_STORAGE_KEY = "travel-weather-locale";

const messages = {
  en: {
    activityHighlights: {
      indoorSightseeingCopy: "Rain, wind, and awkward temperatures lift indoor-friendly days.",
      indoorSightseeingTitle: "Indoor sightseeing",
      outdoorSightseeingCopy: "Mild temperatures, low rain risk, and sunshine drive the score.",
      outdoorSightseeingTitle: "Outdoor sightseeing",
      skiingCopy: "Cold snaps, fresh snowfall, and lower thaw risk get ranked first.",
      skiingTitle: "Skiing",
      surfingCopy: "Nearest-sea wave conditions are blended with on-land weather comfort.",
      surfingTitle: "Surfing",
    },
    activityLabels: {
      INDOOR_SIGHTSEEING: "Indoor sightseeing",
      OUTDOOR_SIGHTSEEING: "Outdoor sightseeing",
      SKIING: "Skiing",
      SURFING: "Surfing",
    },
    bestDay: "Best day",
    noBestDayAvailable: "No viable day in this forecast.",
    heroBadge: "Travel Weather Planner",
    heroCopy: "Compare surfing, sightseeing, skiing, and indoor options over the next seven days.",
    heroTitle: "Weather-ranked escapes.",
    languageEnglish: "English",
    languagePortuguese: "Portuguese",
    languageToggleLabel: "Language",
    rankingBadge: "Ranking",
    rankingEmpty: "Pick a destination above to fetch its ranking.",
    rankingLoading: (locationLabel: string) => `Loading ${locationLabel}...`,
    rankingSubtitle: "Pick a destination to compare the next seven days across each activity.",
    rankingTitle: "Seven-day desirability breakdown",
    scoreDriversBadge: "Score Drivers",
    scoreDriversCopy:
      "Each activity is ranked with different weather signals so you can quickly see why a city leans toward snow, swell, sunshine, or indoor fallback plans.",
    searchError: "Could not search destinations.",
    searchLabel: "Choose a city",
    searchNoMatches: "No destinations matched that search.",
    searchPlaceholder: "Search for Florianopolis, Itacare, Ubatuba...",
    searchSearching: "Searching cities...",
    temperatureCelsius: "°C",
    temperatureFahrenheit: "°F",
    themeDark: "Dark",
    themeLight: "Light",
    themeSystem: "System",
    themeToggleLabel: "Theme",
    updatedAt: (formattedValue: string) => `Updated ${formattedValue}`,
  },
  "pt-BR": {
    activityHighlights: {
      indoorSightseeingCopy:
        "Chuva, vento e temperaturas desconfortáveis favorecem programas em ambientes fechados.",
      indoorSightseeingTitle: "Passeios internos",
      outdoorSightseeingCopy:
        "Temperaturas amenas, baixo risco de chuva e sol ajudam a puxar a nota para cima.",
      outdoorSightseeingTitle: "Passeios externos",
      skiingCopy: "Frio intenso, neve fresca e menor risco de degelo costumam liderar o ranking.",
      skiingTitle: "Esqui",
      surfingCopy: "As ondas do mar mais próximo são combinadas com o conforto do clima em terra.",
      surfingTitle: "Surfe",
    },
    activityLabels: {
      INDOOR_SIGHTSEEING: "Passeios internos",
      OUTDOOR_SIGHTSEEING: "Passeios externos",
      SKIING: "Esqui",
      SURFING: "Surfe",
    },
    bestDay: "Melhor dia",
    noBestDayAvailable: "Nenhum dia viavel nesta previsao.",
    heroBadge: "Planejador de viagens com base no clima",
    heroCopy:
      "Compare surfe, passeios, esqui e opções em ambientes fechados para os próximos sete dias.",
    heroTitle: "Passeios guiados pelo clima.",
    languageEnglish: "Inglês",
    languagePortuguese: "Português",
    languageToggleLabel: "Idioma",
    rankingBadge: "Ranking",
    rankingEmpty: "Escolha um destino acima para carregar o ranking.",
    rankingLoading: (locationLabel: string) => `Carregando ${locationLabel}...`,
    rankingSubtitle: "Compare os proximos sete dias de cada atividade.",
    rankingTitle: "Atratividade nos próximos sete dias",
    scoreDriversBadge: "Critérios",
    scoreDriversCopy:
      "Cada atividade recebe pesos diferentes dos sinais de clima para mostrar rapidamente por que uma cidade favorece neve, swell, sol ou um plano indoor.",
    searchError: "Não foi possível buscar destinos.",
    searchLabel: "Escolha uma cidade",
    searchNoMatches: "Nenhum destino correspondeu à busca.",
    searchPlaceholder: "Busque por Florianopolis, Itacare, Ubatuba...",
    searchSearching: "Buscando cidades...",
    temperatureCelsius: "°C",
    temperatureFahrenheit: "°F",
    themeDark: "Escuro",
    themeLight: "Claro",
    themeSystem: "Sistema",
    themeToggleLabel: "Tema",
    updatedAt: (formattedValue: string) => `Atualizado ${formattedValue}`,
  },
} as const;

interface I18nContextValue {
  formatCoordinate: (value: number) => string;
  formatDay: (value: string) => string;
  formatTimestamp: (value: string) => string;
  locale: AppLocale;
  messages: (typeof messages)[AppLocale];
  setLocale: (locale: AppLocale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isSupportedLocale(value: string | null): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

function detectBrowserLocale(): AppLocale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  return navigator.language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isSupportedLocale(storedLocale) ? storedLocale : detectBrowserLocale();
}

function parseDateValue(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day), 12);
  }

  return new Date(value);
}

function formatSafeDate(locale: AppLocale, value: string, options: Intl.DateTimeFormatOptions) {
  const date = parseDateValue(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(() => readStoredLocale());

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      formatCoordinate: (nextValue: number) =>
        new Intl.NumberFormat(locale, {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        }).format(nextValue),
      formatDay: (nextValue: string) =>
        formatSafeDate(locale, nextValue, {
          day: "numeric",
          month: "short",
        }),
      formatTimestamp: (nextValue: string) =>
        formatSafeDate(locale, nextValue, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      locale,
      messages: messages[locale],
      setLocale,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
