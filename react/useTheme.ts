import { useCallback, useEffect, useState } from "react";

export const THEMES = ["board", "paper", "cupertino", "atlas"] as const;
export type Theme = (typeof THEMES)[number];

const KEY = "mk-theme";

function isTheme(v: string | null): v is Theme {
  return v !== null && (THEMES as readonly string[]).includes(v);
}

/**
 * Reads and writes `data-theme` on <html>. Set the theme server-side too if you
 * care about a flash: `<html data-theme="scope">` in the root layout.
 */
export function useTheme(initial: Theme = "board") {
  const [theme, setThemeState] = useState<Theme>(initial);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (isTheme(stored)) setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(KEY, next);
    setThemeState(next);
  }, []);

  return { theme, setTheme, themes: THEMES };
}
