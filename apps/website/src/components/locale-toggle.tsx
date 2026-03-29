import { Languages } from "lucide-react";
import { cn } from "../lib/utils.js";
import { supportedLocales, type AppLocale, useI18n } from "../lib/i18n.js";
import { Button } from "./ui/button.js";

const localeShortLabels: Record<AppLocale, string> = {
  en: "EN",
  "pt-BR": "PT",
};

interface LocaleToggleProps {
  className?: string;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}

export function LocaleToggle({ className, locale, onLocaleChange }: LocaleToggleProps) {
  const { messages } = useI18n();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Languages className="size-4 text-muted-foreground" />
      <div
        className="inline-flex rounded-full border border-border/70 bg-background/60 p-1 shadow-sm backdrop-blur"
        role="group"
        aria-label={messages.languageToggleLabel}
      >
        {supportedLocales.map((nextLocale) => {
          const label =
            nextLocale === "en" ? messages.languageEnglish : messages.languagePortuguese;

          return (
            <Button
              key={nextLocale}
              type="button"
              size="sm"
              variant="ghost"
              aria-pressed={locale === nextLocale}
              onClick={() => onLocaleChange(nextLocale)}
              className={cn(
                "rounded-full px-2.5 text-xs font-medium text-muted-foreground",
                locale === nextLocale
                  ? "bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary"
                  : "hover:text-foreground",
              )}
              title={label}
            >
              {localeShortLabels[nextLocale]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
