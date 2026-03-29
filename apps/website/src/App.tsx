import { I18nProvider } from "./lib/i18n.js";
import { ThemeProvider } from "./lib/theme.js";
import { HomePage } from "./pages/home-page.js";

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <HomePage />
      </I18nProvider>
    </ThemeProvider>
  );
}
