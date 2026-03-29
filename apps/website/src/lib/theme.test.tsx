import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { ThemeProvider, THEME_STORAGE_KEY, useTheme } from "./theme.js";

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return {
    change(matches: boolean) {
      mediaQuery.matches = matches;
      const event = { matches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function ThemeHarness() {
  const { resolvedTheme, setThemeMode, themeMode } = useTheme();

  return (
    <div>
      <p>mode:{themeMode}</p>
      <p>resolved:{resolvedTheme}</p>
      <button type="button" onClick={() => setThemeMode("light")}>
        Light
      </button>
      <button type="button" onClick={() => setThemeMode("dark")}>
        Dark
      </button>
      <button type="button" onClick={() => setThemeMode("system")}>
        System
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
  vi.unstubAllGlobals();
});

test("uses system theme by default when no preference is stored", () => {
  mockMatchMedia(true);

  render(
    <ThemeProvider>
      <ThemeHarness />
    </ThemeProvider>,
  );

  expect(screen.getByText("mode:system")).toBeTruthy();
  expect(screen.getByText("resolved:dark")).toBeTruthy();
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("persists explicit theme selection and updates the root class", () => {
  mockMatchMedia(false);

  render(
    <ThemeProvider>
      <ThemeHarness />
    </ThemeProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Dark" }));

  expect(screen.getByText("mode:dark")).toBeTruthy();
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  expect(document.documentElement.classList.contains("dark")).toBe(true);
});

test("follows system theme changes when mode is system", () => {
  const media = mockMatchMedia(false);

  render(
    <ThemeProvider>
      <ThemeHarness />
    </ThemeProvider>,
  );

  expect(screen.getByText("resolved:light")).toBeTruthy();
  media.change(true);

  return waitFor(() => {
    expect(screen.getByText("resolved:dark")).toBeTruthy();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
