import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { useI18n } from "../lib/i18n.js";
import { cn } from "../lib/utils.js";
import { themeModes, type ThemeMode } from "../lib/theme.js";
import { Button } from "./ui/button.js";

interface ThemeToggleProps {
  className?: string;
  onThemeModeChange: (mode: ThemeMode) => void;
  themeMode: ThemeMode;
}

export function ThemeToggle({ className, onThemeModeChange, themeMode }: ThemeToggleProps) {
  const { messages } = useI18n();
  const themeMeta: Record<
    ThemeMode,
    {
      icon: typeof Sun;
      label: string;
    }
  > = {
    light: {
      icon: Sun,
      label: messages.themeLight,
    },
    dark: {
      icon: Moon,
      label: messages.themeDark,
    },
    system: {
      icon: LaptopMinimal,
      label: messages.themeSystem,
    },
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div
        className="inline-flex rounded-full border border-border/70 bg-background/60 p-1 shadow-sm backdrop-blur"
        role="group"
        aria-label={messages.themeToggleLabel}
      >
        {themeModes.map((mode) => {
          const { icon: Icon, label } = themeMeta[mode];

          return (
            <Button
              key={mode}
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={themeMode === mode}
              onClick={() => onThemeModeChange(mode)}
              className={cn(
                "rounded-full px-2.5 text-xs font-medium text-muted-foreground",
                themeMode === mode
                  ? "bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary"
                  : "hover:text-foreground",
              )}
              title={label}
            >
              <Icon className="size-3.5" />
              <span className="sr-only">{label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
