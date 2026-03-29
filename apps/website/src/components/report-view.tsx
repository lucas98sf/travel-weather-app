import { Suspense } from "react";
import { graphql, useFragment, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { useI18n } from "../lib/i18n.js";
import { cn } from "../lib/utils.js";
import { temperatureUnitOptions, type TemperatureUnit } from "../lib/temperature.js";
import { ActivityCard } from "./activity-card.js";
import { Badge } from "./ui/badge.js";
import { Button } from "./ui/button.js";
import { Card, CardContent } from "./ui/card.js";
import type {
  reportView_report$data,
  reportView_report$key,
} from "../__generated__/reportView_report.graphql";
import type { reportViewTravelActivityRankingQuery } from "../__generated__/reportViewTravelActivityRankingQuery.graphql";

interface ReportViewProps {
  queryRef: PreloadedQuery<reportViewTravelActivityRankingQuery>;
  temperatureUnit: TemperatureUnit;
  onTemperatureUnitChange: (unit: TemperatureUnit) => void;
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

function formatLocationLabel(location: reportView_report$data["location"]) {
  return [location.name, location.region, location.country].filter(Boolean).join(", ");
}

function ReportViewContent({
  queryRef,
  temperatureUnit,
  onTemperatureUnitChange,
}: ReportViewProps) {
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
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {report.location.timezone}
            </Badge>
            <h3 className="truncate font-serif text-[1.75rem] leading-none text-foreground xl:text-[1.95rem]">
              {formatLocationLabel(report.location)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {messages.updatedAt(formatTimestamp(report.generatedAt))}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <div
              className="inline-flex rounded-full border border-border/70 bg-muted/30 p-1"
              role="group"
              aria-label="Temperature unit"
            >
              {temperatureUnitOptions.map((unit) => (
                <Button
                  key={unit}
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-pressed={temperatureUnit === unit}
                  onClick={() => onTemperatureUnitChange(unit)}
                  className={cn(
                    "rounded-full px-3 text-xs font-medium",
                    temperatureUnit === unit
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {unit === "celsius"
                    ? messages.temperatureCelsius
                    : messages.temperatureFahrenheit}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2.5 xl:grid-cols-2">
        {report.activities.map((activity) => (
          <ActivityCard
            key={activity.activity}
            recommendationRef={activity}
            temperatureUnit={temperatureUnit}
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
    <Suspense fallback={null}>
      <ReportViewContent {...props} />
    </Suspense>
  );
}
