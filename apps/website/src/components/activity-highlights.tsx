import { Mountain, Search, Warehouse, Waves } from "lucide-react";
import { useI18n } from "../lib/i18n.js";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.js";

export function ActivityHighlights() {
  const { messages } = useI18n();
  const activityHighlights = [
    {
      title: messages.activityHighlights.skiingTitle,
      copy: messages.activityHighlights.skiingCopy,
      icon: Mountain,
    },
    {
      title: messages.activityHighlights.surfingTitle,
      copy: messages.activityHighlights.surfingCopy,
      icon: Waves,
    },
    {
      title: messages.activityHighlights.outdoorSightseeingTitle,
      copy: messages.activityHighlights.outdoorSightseeingCopy,
      icon: Search,
    },
    {
      title: messages.activityHighlights.indoorSightseeingTitle,
      copy: messages.activityHighlights.indoorSightseeingCopy,
      icon: Warehouse,
    },
  ] as const;

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {activityHighlights.map((item) => (
        <Card
          key={item.title}
          className="h-full rounded-[1.4rem] border-border/60 bg-background/45"
        >
          <CardHeader className="p-3.5 pb-2">
            <CardTitle className="flex items-center gap-2 text-[0.98rem]">
              <item.icon className="size-4 text-primary" />
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <p className="text-xs leading-5 text-muted-foreground md:text-[0.76rem] xl:line-clamp-2">
              {item.copy}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
