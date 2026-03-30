import { Suspense } from "react";
import { graphql, useFragment, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { useI18n } from "../lib/i18n.js";
import { formatLocationLabel } from "../lib/location.js";
import { ActivityCard } from "./activity-card.js";
import { Card, CardContent } from "./ui/card.js";
import { Skeleton } from "./ui/skeleton.js";
import type { reportView_report$key } from "../__generated__/reportView_report.graphql";
import type { reportViewTravelActivityRankingQuery } from "../__generated__/reportViewTravelActivityRankingQuery.graphql";

interface ReportViewProps {
  queryRef: PreloadedQuery<reportViewTravelActivityRankingQuery>;
}

export const travelActivityRankingQueryNode = graphql`
  query reportViewTravelActivityRankingQuery($locale: String!, $locationId: String!) {
    travelActivityRanking(locale: $locale, locationId: $locationId) {
      ...reportView_report
    }
  }
`;

const reportFragmentNode = graphql`
  fragment reportView_report on TravelActivityReport {
    generatedAt
    location {
      name
      region
      country
      timezone
    }
    activities {
      activity
      ...activityCard_recommendation
    }
    dailySummaries {
      activity
      date
      factors {
        key
        label
        impact
        value
        unit
      }
      label
      score
    }
  }
`;

export function ReportViewSkeleton() {
  return (
    <div className="space-y-3">
      <Card className="rounded-[1.35rem] border-border/60 bg-background/50">
        <CardContent className="grid gap-2.5 p-3.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-9 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2.5 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="h-full rounded-[1.35rem] border-border/60 bg-background/55">
            <CardContent className="space-y-3 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-7 w-12 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-8 w-18 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }, (_, dayIndex) => (
                  <Skeleton key={dayIndex} className="h-18 rounded-[0.95rem]" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReportViewContent({ queryRef }: ReportViewProps) {
  const { formatTimestamp, messages } = useI18n();
  const query = usePreloadedQuery(travelActivityRankingQueryNode, queryRef);
  const report = useFragment<reportView_report$key>(
    reportFragmentNode,
    query.travelActivityRanking,
  );

  return (
    <div className="space-y-3">
      <Card className="rounded-[1.35rem] border-border/60 bg-background/50">
        <CardContent className="grid gap-2.5 p-3.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="min-w-0 space-y-1.5">
            <h3 className="truncate font-serif text-[1.75rem] leading-none text-foreground xl:text-[1.95rem]">
              {formatLocationLabel(report.location)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {messages.updatedAt(formatTimestamp(report.generatedAt))}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2.5 xl:grid-cols-2">
        {report.activities.map((activity) => (
          <ActivityCard
            key={activity.activity}
            recommendationRef={activity}
            dailySummaries={report.dailySummaries.filter(
              (item) => item.activity === activity.activity,
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function ReportView(props: ReportViewProps) {
  return (
    <Suspense fallback={<ReportViewSkeleton />}>
      <ReportViewContent {...props} />
    </Suspense>
  );
}
