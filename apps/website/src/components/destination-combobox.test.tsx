import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useState } from "react";
import type { FragmentRefs } from "relay-runtime";
import type {
  destinationCombobox_destination$data,
  destinationCombobox_destination$key,
} from "../__generated__/destinationCombobox_destination.graphql";
import { I18nProvider } from "../lib/i18n.js";
import { DestinationCombobox, type DestinationOption } from "./destination-combobox.js";

afterEach(() => {
  cleanup();
});

const florianopolis: DestinationOption = {
  id: "fln",
  name: "Florianopolis",
  region: "Santa Catarina",
  country: "Brazil",
  latitude: -27.59,
  longitude: -48.55,
  timezone: "America/Sao_Paulo",
};

const ubatuba: DestinationOption = {
  id: "uba",
  name: "Ubatuba",
  region: "Sao Paulo",
  country: "Brazil",
  latitude: -23.43,
  longitude: -45.07,
  timezone: "America/Sao_Paulo",
};

function createDestinationFragmentKey(
  destination: DestinationOption,
): destinationCombobox_destination$key {
  const data: destinationCombobox_destination$data = {
    ...destination,
    " $fragmentType": "destinationCombobox_destination",
  };

  return {
    " $data": data,
    " $fragmentSpreads": {} as FragmentRefs<"destinationCombobox_destination">,
  };
}

function DestinationComboboxHarness({
  errorForQuery,
  initialQuery = "",
}: {
  errorForQuery?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<destinationCombobox_destination$key[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearchError(null);
      setHighlightedIndex(-1);
      return;
    }

    setIsSearching(true);
    const timeoutId = window.setTimeout(() => {
      if (errorForQuery && query === errorForQuery) {
        setResults([]);
        setSearchError("Could not search destinations.");
        setHighlightedIndex(-1);
      } else {
        const nextResults = [florianopolis, ubatuba].filter((location) =>
          location.name.toLowerCase().includes(query.toLowerCase()),
        );
        setResults(nextResults.map(createDestinationFragmentKey));
        setSearchError(null);
        setHighlightedIndex(nextResults.length > 0 ? 0 : -1);
      }
      setIsSearching(false);
      setIsOpen(true);
    }, 10);

    return () => window.clearTimeout(timeoutId);
  }, [errorForQuery, query]);

  return (
    <I18nProvider>
      <DestinationCombobox
        query={query}
        results={results}
        isSearching={isSearching}
        searchError={searchError}
        selectedLocationId={selectedLocationId}
        isOpen={isOpen}
        highlightedIndex={highlightedIndex}
        onOpenChange={setIsOpen}
        onHighlightChange={setHighlightedIndex}
        onQueryChange={setQuery}
        onSelect={(location) => {
          setQuery([location.name, location.region, location.country].filter(Boolean).join(", "));
          setSelectedLocationId(location.id);
          setIsOpen(false);
        }}
      />
    </I18nProvider>
  );
}

test("typing shows matching destination options", async () => {
  const user = userEvent.setup();
  render(<DestinationComboboxHarness />);

  await user.type(screen.getByLabelText("Choose a city"), "uba");

  await screen.findByRole("option", { name: /ubatuba, sao paulo, brazil/i });
  expect(screen.queryByRole("option", { name: /florianopolis/i })).toBeNull();
});

test("keyboard navigation highlights options and enter selects the active city", async () => {
  const user = userEvent.setup();
  render(<DestinationComboboxHarness />);

  const input = screen.getByLabelText("Choose a city");
  await user.type(input, "a");

  await screen.findByRole("option", { name: /florianopolis/i });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  await waitFor(() => {
    expect(screen.getByDisplayValue("Ubatuba, Sao Paulo, Brazil")).toBeTruthy();
  });
});

test("shows an inline empty state when no destinations match", async () => {
  const user = userEvent.setup();
  render(<DestinationComboboxHarness />);

  await user.type(screen.getByLabelText("Choose a city"), "zurich");

  await screen.findByText("No destinations matched that search.");
});

test("shows an inline error state when the search fails", async () => {
  const user = userEvent.setup();
  render(<DestinationComboboxHarness errorForQuery="err" />);

  await user.type(screen.getByLabelText("Choose a city"), "err");

  await screen.findByText("Could not search destinations.");
});

test("clicking an option updates the input text to the chosen city label", async () => {
  const user = userEvent.setup();
  render(<DestinationComboboxHarness initialQuery="flo" />);

  const option = await screen.findByRole("option", {
    name: /florianopolis, santa catarina, brazil/i,
  });
  await user.click(option);

  expect(screen.getByDisplayValue("Florianopolis, Santa Catarina, Brazil")).toBeTruthy();
});
