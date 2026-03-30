import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { I18nProvider, LOCALE_STORAGE_KEY, useI18n } from "./i18n.js";
import { getMeasurementSystem } from "./temperature.js";

function I18nHarness() {
  const { formatDay, locale, messages, setLocale } = useI18n();

  return (
    <div>
      <p>locale:{locale}</p>
      <p>label:{messages.searchLabel}</p>
      <p>day:{formatDay("2026-03-30")}</p>
      <button type="button" onClick={() => setLocale("en")}>
        English
      </button>
      <button type="button" onClick={() => setLocale("pt-BR")}>
        Portuguese
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.unstubAllGlobals();
});

test("uses portuguese when the browser prefers portuguese", () => {
  vi.stubGlobal("navigator", { language: "pt-BR" });

  render(
    <I18nProvider>
      <I18nHarness />
    </I18nProvider>,
  );

  expect(screen.getByText("locale:pt-BR")).toBeTruthy();
  expect(screen.getByText("label:Escolha uma cidade")).toBeTruthy();
});

test("persists explicit locale selection and updates document lang", () => {
  vi.stubGlobal("navigator", { language: "en-US" });

  render(
    <I18nProvider>
      <I18nHarness />
    </I18nProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Portuguese" }));

  expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("pt-BR");
  expect(document.documentElement.lang).toBe("pt-BR");
  expect(screen.getByText("locale:pt-BR")).toBeTruthy();
});

test("locale changes switch the derived measurement system", () => {
  vi.stubGlobal("navigator", { language: "en-US" });

  render(
    <I18nProvider>
      <I18nHarness />
    </I18nProvider>,
  );

  expect(getMeasurementSystem("en")).toBe("imperial");

  fireEvent.click(screen.getByRole("button", { name: "Portuguese" }));

  expect(getMeasurementSystem("pt-BR")).toBe("metric");
});

test("formats forecast date strings without shifting them to the previous day", () => {
  vi.stubGlobal("navigator", { language: "pt-BR" });

  render(
    <I18nProvider>
      <I18nHarness />
    </I18nProvider>,
  );

  expect(screen.getByText(/day:30 de mar\./i)).toBeTruthy();
});
