export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
// Browser chrome colour per theme; index.html has the same values for the first paint
const THEME_COLORS = { light: "#121417", dark: "#07080A" };

export const getThemeChoice = (): ThemeChoice => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage can be blocked; fall back to the system setting
  }
  return "system";
};

/**
 * Applies the choice to <html data-theme> (the styles read it, see styles/_theme.scss)
 * and remembers it. "system" removes the attribute so prefers-color-scheme decides.
 */
export const applyTheme = (choice: ThemeChoice) => {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;

  try {
    if (choice === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // The choice still applies for this visit
  }

  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const scheme = meta.media.includes("dark") ? "dark" : "light";
    meta.content = THEME_COLORS[choice === "system" ? scheme : choice];
  });
};
