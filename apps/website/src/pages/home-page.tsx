import { useEffect, useRef, useState } from "react";
import { fetchQuery, graphql, readInlineData, useQueryLoader } from "react-relay";
import { ActivityHighlights } from "../components/activity-highlights.js";
import {
  DestinationCombobox,
  destinationOptionFragment,
  type DestinationOption,
} from "../components/destination-combobox.js";
import { LocaleToggle } from "../components/locale-toggle.js";
import { RankingPanel } from "../components/ranking-panel.js";
import { travelActivityRankingQueryNode } from "../components/report-view.js";
import { ThemeToggle } from "../components/theme-toggle.js";
import { Badge } from "../components/ui/badge.js";
import { DEFAULT_DESTINATION_QUERY } from "../lib/constants.js";
import { useI18n } from "../lib/i18n.js";
import { relayEnvironment } from "../lib/relay.js";
import type { TemperatureUnit } from "../lib/temperature.js";
import { useTheme } from "../lib/theme.js";
import type { destinationCombobox_destination$key } from "../__generated__/destinationCombobox_destination.graphql";
import type { homePageSearchDestinationsQuery } from "../__generated__/homePageSearchDestinationsQuery.graphql";
import type { reportViewTravelActivityRankingQuery } from "../__generated__/reportViewTravelActivityRankingQuery.graphql";

const searchDestinationsQueryNode = graphql`
  query homePageSearchDestinationsQuery($locale: String!, $query: String!) {
    searchDestinations(locale: $locale, query: $query) {
      id
      name
      region
      country
      ...destinationCombobox_destination
    }
  }
`;

function formatDestinationLabel(location: Pick<DestinationOption, "country" | "name" | "region">) {
  return [location.name, location.region, location.country].filter(Boolean).join(", ");
}

export function HomePage() {
  const { locale, messages, setLocale } = useI18n();
  const { setThemeMode, themeMode } = useTheme();
  const [query, setQuery] = useState(DEFAULT_DESTINATION_QUERY);
  const [results, setResults] = useState<
    homePageSearchDestinationsQuery["response"]["searchDestinations"]
  >([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<string | null>(null);
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius");
  const requestSequence = useRef(0);
  const suppressNextQueryEffect = useRef(false);
  const closeDropdownTimeout = useRef<number | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [queryRef, loadReportQuery] = useQueryLoader<reportViewTravelActivityRankingQuery>(
    travelActivityRankingQueryNode,
  );

  async function runSearch(
    nextQuery: string,
    options: { autoSelectFirst?: boolean; openDropdown?: boolean } = {},
  ) {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setResults([]);
      setSearchError(null);
      setHighlightedIndex(-1);
      setIsDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    const currentRequest = requestSequence.current + 1;
    requestSequence.current = currentRequest;
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetchQuery<homePageSearchDestinationsQuery>(
        relayEnvironment,
        searchDestinationsQueryNode,
        {
          locale,
          query: trimmed,
        },
      ).toPromise();

      if (currentRequest !== requestSequence.current) {
        return;
      }

      const nextResults = response?.searchDestinations ?? [];
      setResults(nextResults);
      setHighlightedIndex(nextResults.length > 0 ? 0 : -1);
      setIsDropdownOpen(options.openDropdown ?? true);

      if (options.autoSelectFirst && nextResults.length > 0) {
        const firstLocation = nextResults[0];
        if (firstLocation?.id) {
          handleSelect(
            readInlineData<destinationCombobox_destination$key>(
              destinationOptionFragment,
              firstLocation,
            ),
            { suppressSearch: true },
          );
        }
      }
    } catch (error) {
      if (currentRequest !== requestSequence.current) {
        return;
      }
      setSearchError(error instanceof Error ? error.message : messages.searchError);
      setHighlightedIndex(-1);
      setIsDropdownOpen(options.openDropdown ?? true);
    } finally {
      if (currentRequest === requestSequence.current) {
        setIsSearching(false);
      }
    }
  }

  useEffect(() => {
    suppressNextQueryEffect.current = true;
    void runSearch(DEFAULT_DESTINATION_QUERY, { autoSelectFirst: true, openDropdown: false });
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      loadReportQuery(
        { locale, locationId: selectedLocationId },
        {
          fetchPolicy: "network-only",
        },
      );
    }

    if (query.trim()) {
      void runSearch(query, { openDropdown: false });
    }
  }, [locale]);

  useEffect(() => {
    if (suppressNextQueryEffect.current) {
      suppressNextQueryEffect.current = false;
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      setHighlightedIndex(-1);
      setIsDropdownOpen(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void runSearch(trimmed, { openDropdown: true });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      if (closeDropdownTimeout.current !== null) {
        window.clearTimeout(closeDropdownTimeout.current);
      }
    };
  }, []);

  function handleSelect(location: DestinationOption, options: { suppressSearch?: boolean } = {}) {
    const locationId = location.id;
    const locationLabel = formatDestinationLabel(location);

    if (options.suppressSearch) {
      suppressNextQueryEffect.current = true;
    }

    setQuery(locationLabel);
    setSelectedLocationId(locationId);
    setSelectedLocationLabel(locationLabel);
    setHighlightedIndex(-1);
    setIsDropdownOpen(false);
    loadReportQuery(
      { locale, locationId },
      {
        fetchPolicy: "network-only",
      },
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_24%),linear-gradient(180deg,_hsl(32_100%_97%)_0%,_hsl(var(--background))_42%,_hsl(205_65%_93%)_100%)] px-4 py-6 transition-colors md:px-6 md:py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_26%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(204_44%_8%)_100%)] lg:h-screen lg:overflow-hidden lg:px-5 lg:py-4">
      <div className="fixed top-4 left-4 z-40 md:top-6 md:left-6">
        <div className="flex items-center rounded-full border border-border/60 bg-card/70 px-2 py-1.5 shadow-lg shadow-black/8 backdrop-blur dark:shadow-black/20">
          <LocaleToggle locale={locale} onLocaleChange={setLocale} />
        </div>
      </div>

      <div className="fixed top-4 right-4 z-40 md:top-6 md:right-6">
        <div className="flex items-center rounded-full border border-border/60 bg-card/70 px-2 py-1.5 shadow-lg shadow-black/8 backdrop-blur dark:shadow-black/20">
          <ThemeToggle themeMode={themeMode} onThemeModeChange={setThemeMode} />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[96rem] gap-4 lg:h-full lg:grid-cols-[minmax(19rem,0.74fr)_minmax(0,1.26fr)] lg:items-start xl:gap-5">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-2xl shadow-black/10 backdrop-blur md:p-5 dark:shadow-black/30 lg:self-start">
          <div className="space-y-2.5">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 uppercase tracking-[0.22em]"
            >
              {messages.heroBadge}
            </Badge>
            <div className="space-y-1.5">
              <h1 className="max-w-3xl font-serif text-[3.25rem] leading-[0.92] text-foreground md:text-[4.1rem] xl:text-[3.8rem] 2xl:text-[4.1rem]">
                {messages.heroTitle}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground lg:hidden">
                {messages.heroCopy}
              </p>
            </div>
          </div>

          <div
            ref={searchContainerRef}
            onBlur={() => {
              if (closeDropdownTimeout.current !== null) {
                window.clearTimeout(closeDropdownTimeout.current);
              }

              closeDropdownTimeout.current = window.setTimeout(() => {
                if (!searchContainerRef.current?.contains(document.activeElement)) {
                  setIsDropdownOpen(false);
                }
              }, 0);
            }}
            className="relative"
          >
            <DestinationCombobox
              query={query}
              results={results}
              isSearching={isSearching}
              searchError={searchError}
              selectedLocationId={selectedLocationId}
              isOpen={isDropdownOpen}
              highlightedIndex={highlightedIndex}
              onOpenChange={setIsDropdownOpen}
              onHighlightChange={setHighlightedIndex}
              onQueryChange={setQuery}
              onSelect={(location) => handleSelect(location, { suppressSearch: true })}
            />
          </div>

          <div>
            <ActivityHighlights />
          </div>
        </section>

        <div className="lg:h-full lg:min-h-0">
          <RankingPanel
            queryRef={queryRef}
            selectedLocationLabel={selectedLocationLabel}
            temperatureUnit={temperatureUnit}
            onTemperatureUnitChange={setTemperatureUnit}
          />
        </div>
      </div>
    </main>
  );
}
