import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { graphql, readInlineData } from "react-relay";
import type {
  destinationCombobox_destination$data,
  destinationCombobox_destination$key,
} from "../__generated__/destinationCombobox_destination.graphql";
import { useI18n } from "../lib/i18n.js";
import { Input } from "./ui/input.js";
import { cn } from "../lib/utils.js";
import { formatLocationLabel } from "../lib/location.js";

export const destinationOptionFragment = graphql`
  fragment destinationCombobox_destination on LocationOption @inline {
    country
    id
    latitude
    longitude
    name
    region
    timezone
  }
`;

export interface DestinationOption {
  readonly country: string;
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
  readonly region: string | null | undefined;
  readonly timezone: string;
}

interface DestinationComboboxProps {
  highlightedIndex: number;
  isOpen: boolean;
  isSearching: boolean;
  onHighlightChange: (index: number) => void;
  onOpenChange: (isOpen: boolean) => void;
  onQueryChange: (value: string) => void;
  onSelect: (location: DestinationOption) => void;
  query: string;
  results: ReadonlyArray<destinationCombobox_destination$key>;
  searchError: string | null;
  selectedLocationId: string | null;
}

const listboxId = "destination-search-results";

export function DestinationCombobox({
  highlightedIndex,
  isOpen,
  isSearching,
  onHighlightChange,
  onOpenChange,
  onQueryChange,
  onSelect,
  query,
  results,
  searchError,
  selectedLocationId,
}: DestinationComboboxProps) {
  const { formatCoordinate, messages } = useI18n();
  const destinations = results.map((location) =>
    readInlineData<destinationCombobox_destination$key>(destinationOptionFragment, location),
  );
  const showDropdown = isOpen && (isSearching || Boolean(searchError) || query.trim().length > 0);
  const activeOptionId =
    highlightedIndex >= 0 && highlightedIndex < destinations.length
      ? `${listboxId}-${destinations[highlightedIndex]?.id}`
      : undefined;

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!showDropdown) {
        onOpenChange(true);
      }
      if (destinations.length > 0) {
        onHighlightChange((highlightedIndex + 1) % destinations.length);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!showDropdown) {
        onOpenChange(true);
      }
      if (destinations.length > 0) {
        onHighlightChange(highlightedIndex <= 0 ? destinations.length - 1 : highlightedIndex - 1);
      }
      return;
    }

    if (event.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < destinations.length) {
      event.preventDefault();
      onSelect(destinations[highlightedIndex]!);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  }

  return (
    <div className="relative">
      <label
        htmlFor="destination-search"
        className="mb-2 block text-sm font-medium text-foreground"
      >
        {messages.searchLabel}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="destination-search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={showDropdown ? activeOptionId : undefined}
          aria-expanded={showDropdown}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            onQueryChange(event.currentTarget.value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
          onKeyDown={handleKeyDown}
          placeholder={messages.searchPlaceholder}
          className="h-12 rounded-2xl border-border/70 bg-background/70 pr-4 pl-11 text-base"
        />
      </div>

      {showDropdown ? (
        <div
          className="absolute z-20 mt-3 w-full overflow-hidden rounded-[1.5rem] border border-border/70 bg-popover/95 shadow-2xl shadow-black/10 backdrop-blur dark:shadow-black/30"
          role="presentation"
        >
          <ul id={listboxId} role="listbox" className="max-h-96 overflow-y-auto p-2">
            {isSearching ? (
              <li className="rounded-xl px-4 py-3 text-sm text-muted-foreground">
                {messages.searchSearching}
              </li>
            ) : null}
            {!isSearching && searchError ? (
              <li className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {searchError}
              </li>
            ) : null}
            {!isSearching && !searchError && destinations.length === 0 ? (
              <li className="rounded-xl px-4 py-3 text-sm text-muted-foreground">
                {messages.searchNoMatches}
              </li>
            ) : null}
            {!isSearching && !searchError
              ? destinations.map((location: destinationCombobox_destination$data, index) => {
                  const isActive = index === highlightedIndex;
                  const isSelected = selectedLocationId === location.id;

                  return (
                    <li key={location.id} role="presentation">
                      <button
                        id={`${listboxId}-${location.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => onHighlightChange(index)}
                        onClick={() => onSelect(location)}
                        className={cn(
                          "w-full rounded-[1.15rem] px-4 py-3 text-left transition",
                          isActive || isSelected
                            ? "bg-primary/12 text-foreground"
                            : "text-foreground hover:bg-muted/60",
                        )}
                      >
                        <p className="font-medium">{formatLocationLabel(location)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {location.timezone} • {formatCoordinate(location.latitude)},{" "}
                          {formatCoordinate(location.longitude)}
                        </p>
                      </button>
                    </li>
                  );
                })
              : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
