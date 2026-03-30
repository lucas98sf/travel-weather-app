import { graphql, useFragment } from "react-relay";
import { Landmark, Mountain, TentTree, Waves } from "lucide-react";
import { useI18n } from "../lib/i18n.js";
import { formatFactorForLocale } from "../lib/temperature.js";
import { cn } from "../lib/utils.js";
import { Badge } from "./ui/badge.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.js";
import type {
  activityCard_recommendation$data,
  activityCard_recommendation$key,
} from "../__generated__/activityCard_recommendation.graphql";
import type { reportView_report$data } from "../__generated__/reportView_report.graphql";

type RecommendationActivity = activityCard_recommendation$data["activity"];

const recommendationFragmentNode = graphql`
  fragment activityCard_recommendation on ActivityRecommendation {
    activity
    score
    rank
    bestDay
    summary
    note
    factors {
      key
      label
      impact
      value
      unit
    }
  }
`;

function getActivityIcon(activity: RecommendationActivity) {
  switch (activity) {
    case "SKIING":
      return Mountain;
    case "SURFING":
      return Waves;
    case "OUTDOOR_SIGHTSEEING":
      return TentTree;
    case "INDOOR_SIGHTSEEING":
      return Landmark;
    default:
      return Mountain;
  }
}

function getImpactVariant(impact: string) {
  switch (impact) {
    case "POSITIVE":
      return "default" as const;
    case "NEGATIVE":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

function getRecommendationNote(note: string | null | undefined) {
  if (!note) {
    return null;
  }

  return note;
}

function getImpactPriority(impact: string) {
  switch (impact) {
    case "POSITIVE":
      return 0;
    case "NEUTRAL":
      return 1;
    case "NEGATIVE":
      return 2;
    default:
      return 3;
  }
}

function getCompactFactors(
  factors: ReadonlyArray<activityCard_recommendation$data["factors"][number]>,
) {
  return [...factors]
    .sort((left, right) => getImpactPriority(left.impact) - getImpactPriority(right.impact))
    .slice(0, 3);
}

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      badge: "bg-cyan-500 text-slate-950 hover:bg-cyan-500",
      cell: "border-cyan-500/35 bg-cyan-500/10",
      value: "text-cyan-700 dark:text-cyan-300",
    };
  }

  if (score >= 60) {
    return {
      badge: "bg-sky-500 text-white hover:bg-sky-500",
      cell: "border-sky-500/35 bg-sky-500/10",
      value: "text-sky-700 dark:text-sky-300",
    };
  }

  if (score >= 40) {
    return {
      badge: "bg-indigo-500 text-white hover:bg-indigo-500",
      cell: "border-indigo-500/35 bg-indigo-500/10",
      value: "text-indigo-700 dark:text-indigo-300",
    };
  }

  return {
    badge: "bg-slate-500 text-white hover:bg-slate-500",
    cell: "border-slate-500/35 bg-slate-500/10",
    value: "text-slate-700 dark:text-slate-300",
  };
}

interface ActivityCardProps {
  recommendationRef: activityCard_recommendation$key;
  dailySummaries: ReadonlyArray<reportView_report$data["dailySummaries"][number]>;
}

export function ActivityCard({ recommendationRef, dailySummaries }: ActivityCardProps) {
  const { formatDay, locale, messages } = useI18n();
  const recommendation = useFragment(recommendationFragmentNode, recommendationRef);
  const Icon = getActivityIcon(recommendation.activity);
  const recommendationNote = getRecommendationNote(recommendation.note);
  const compactFactors = getCompactFactors(recommendation.factors);
  const scoreTone = getScoreTone(recommendation.score);
  const showBestDay = recommendation.score > 0;

  return (
    <Card className="h-full rounded-[1.35rem] border-border/60 bg-background/55">
      <CardHeader className="gap-2 p-3.5 pb-2.5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex items-center">
            <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1">
              #{recommendation.rank}
            </Badge>
          </div>
          <CardTitle className="flex min-w-0 items-center justify-center gap-2 text-center text-lg md:text-[1.15rem]">
            <Icon className="size-4.5 shrink-0 text-primary" />
            <span className="truncate">
              {
                messages.activityLabels[
                  recommendation.activity as keyof typeof messages.activityLabels
                ]
              }
            </span>
          </CardTitle>
          <Badge
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold",
              scoreTone.badge,
            )}
          >
            {recommendation.score}/100
          </Badge>
        </div>
        <CardDescription className="hidden text-sm leading-5 text-muted-foreground 2xl:block 2xl:truncate">
          {recommendation.summary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 p-3.5 pt-0">
        {showBestDay ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-green-300/35 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {messages.bestDay}
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatDay(recommendation.bestDay)}
            </p>
          </div>
        ) : null}

        {recommendationNote ? (
          <div className="rounded-2xl bg-amber-100/70 px-3 py-2 text-xs leading-5 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
            {recommendationNote}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5 justify-center">
          {compactFactors.map((factor) => {
            const displayFactor = formatFactorForLocale(factor, locale);

            return (
              <Badge
                key={factor.key}
                variant={getImpactVariant(factor.impact)}
                className="rounded-full px-2 py-1 text-[0.65rem]"
              >
                {factor.label}: {displayFactor.value}
                {displayFactor.unit ?? ""}
              </Badge>
            );
          })}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dailySummaries.map((summary) => (
            <div
              key={`${recommendation.activity}-${summary.date}`}
              role="note"
              tabIndex={0}
              aria-label={`${formatDay(summary.date)}. ${summary.score} out of 100. ${summary.label}${
                showBestDay && summary.date === recommendation.bestDay
                  ? `. ${messages.bestDay}`
                  : ""
              }`}
              className={cn(
                "group relative rounded-[0.95rem] border px-1.5 py-1.5 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                getScoreTone(summary.score).cell,
                showBestDay &&
                  summary.date === recommendation.bestDay &&
                  "border-cyan-500/70 bg-cyan-500/15 shadow-[0_0_0_1px_rgba(6,182,212,0.25)]",
              )}
            >
              {showBestDay && summary.date === recommendation.bestDay ? (
                <div className="absolute top-1 right-1 size-1.5 rounded-full bg-cyan-500" />
              ) : null}
              <p className="text-[0.62rem] tracking-[0.08em] text-muted-foreground">
                {formatDay(summary.date)}
              </p>
              <p
                className={cn(
                  "mt-1 text-[1.05rem] font-semibold leading-none",
                  getScoreTone(summary.score).value,
                )}
              >
                {summary.score}
                <span className="ml-0.5 text-[0.62rem] font-medium text-muted-foreground">
                  /100
                </span>
              </p>
              <p className="mt-1 hidden text-[0.68rem] capitalize text-muted-foreground 2xl:block">
                {summary.label}
              </p>
              <div className="pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2 z-[100] hidden w-32 -translate-x-1/2 rounded-xl border border-border/70 bg-popover/95 px-2.5 py-2 text-left shadow-xl backdrop-blur group-hover:block group-focus-visible:block">
                <p className="text-[0.68rem] font-semibold text-foreground">
                  {formatDay(summary.date)}
                </p>
                <div className="mt-1.5 space-y-1">
                  {summary.factors.map((factor) => {
                    const displayFactor = formatFactorForLocale(factor, locale);

                    return (
                      <p
                        key={`${summary.date}-${factor.key}`}
                        className="text-[0.68rem] text-foreground"
                      >
                        {factor.label}: {displayFactor.value}
                        {displayFactor.unit ?? ""}
                      </p>
                    );
                  })}
                </div>
                {showBestDay && summary.date === recommendation.bestDay ? (
                  <p className="mt-1 text-[0.68rem] font-medium text-cyan-600 dark:text-cyan-300">
                    {messages.bestDay}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
