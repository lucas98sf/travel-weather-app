import { Suspense } from "react";
import { useI18n } from "../lib/i18n.js";
import { Badge } from "./ui/badge.js";
import { Card, CardContent } from "./ui/card.js";
import { Skeleton } from "./ui/skeleton.js";
import { ReportView } from "./report-view.js";
import type { reportViewTravelActivityRankingQuery } from "../__generated__/reportViewTravelActivityRankingQuery.graphql";
import type { TemperatureUnit } from "../lib/temperature.js";
import type { PreloadedQuery } from "react-relay";

interface RankingPanelProps {
  queryRef: PreloadedQuery<reportViewTravelActivityRankingQuery> | null | undefined;
  selectedLocationLabel: string | null;
  temperatureUnit: TemperatureUnit;
  onTemperatureUnitChange: (unit: TemperatureUnit) => void;
}

export function RankingPanel({
  queryRef,
  selectedLocationLabel,
  temperatureUnit,
  onTemperatureUnitChange,
}: RankingPanelProps) {
  const { messages } = useI18n();

  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-2xl shadow-black/10 backdrop-blur md:p-5 dark:shadow-black/30 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="rounded-full px-3 py-1 uppercase tracking-[0.22em]">
            {messages.rankingBadge}
          </Badge>
          <h2 className="mt-2 font-serif text-[2rem] leading-none text-foreground xl:text-[2.35rem]">
            {messages.rankingTitle}
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-5 text-muted-foreground lg:hidden 2xl:block">
          {messages.rankingSubtitle}
        </p>
      </div>

      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        {queryRef ? (
          <Suspense
            fallback={
              <div className="grid gap-3 xl:grid-cols-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-56 rounded-[1.5rem]" />
                ))}
              </div>
            }
          >
            <ReportView
              queryRef={queryRef}
              temperatureUnit={temperatureUnit}
              onTemperatureUnitChange={onTemperatureUnitChange}
            />
          </Suspense>
        ) : (
          <Card className="border-dashed border-border/70 bg-muted/20">
            <CardContent className="flex min-h-48 items-center justify-center p-8 text-center text-muted-foreground">
              {selectedLocationLabel
                ? messages.rankingLoading(selectedLocationLabel)
                : messages.rankingEmpty}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
