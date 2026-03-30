import { Suspense } from "react";
import { useI18n } from "../lib/i18n.js";
import { Badge } from "./ui/badge.js";
import { Card, CardContent } from "./ui/card.js";
import { ReportView, ReportViewSkeleton } from "./report-view.js";
import type { reportViewTravelActivityRankingQuery } from "../__generated__/reportViewTravelActivityRankingQuery.graphql";
import type { PreloadedQuery } from "react-relay";

interface RankingPanelProps {
  queryRef: PreloadedQuery<reportViewTravelActivityRankingQuery> | null | undefined;
  selectedLocationLabel: string | null;
}

export function RankingPanel({ queryRef, selectedLocationLabel }: RankingPanelProps) {
  const { messages } = useI18n();

  return (
    <section className="relative z-20 rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-2xl shadow-black/10 backdrop-blur md:p-5 dark:shadow-black/30 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
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

      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-visible lg:pr-1">
        {queryRef ? (
          <Suspense fallback={<ReportViewSkeleton />}>
            <ReportView queryRef={queryRef} />
          </Suspense>
        ) : selectedLocationLabel ? (
          <ReportViewSkeleton />
        ) : (
          <Card className="border-dashed border-border/70 bg-muted/20">
            <CardContent className="flex min-h-48 items-center justify-center p-8 text-center text-muted-foreground">
              {messages.rankingEmpty}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
