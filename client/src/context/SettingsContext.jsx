import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

export const COLOR_THEMES = [
  { id: "matcha", label: "Matcha Morning", mood: "Calm, paper-quiet, slow living", swatches: ["#6B7A4A", "#B08D57", "#7C8F63"] },
  { id: "amber", label: "Grey & Amber", mood: "Bold, machined, automotive luxury", swatches: ["#2B2B29", "#B9812E", "#6E6A5E"] },
  { id: "tide", label: "Daylight Tide", mood: "Bright, airy, Mediterranean", swatches: ["#2E6E85", "#F0B84C", "#1F4E5F"] },
  { id: "cider", label: "Apple Cider", mood: "Warm, vintage, editorial", swatches: ["#6E2A35", "#C1622D", "#8A5A3E"] },
  { id: "forest", label: "Forest Noir", mood: "Expensive, moody, cinematic", swatches: ["#7C8F63", "#E5EBDD", "#37432A"] },
];

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("custos-theme") || "light");
  const [colorTheme, setColorTheme] = useState(() => {
    const stored = localStorage.getItem("custos-color-theme");
    const validIds = ["matcha", "amber", "tide", "cider", "forest"];
    return validIds.includes(stored) ? stored : "matcha";
  });
  const [currency, setCurrency] = useState(() => localStorage.getItem("custos-currency") || "INR");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("custos-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-theme", colorTheme);
    localStorage.setItem("custos-color-theme", colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem("custos-currency", currency);
  }, [currency]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <SettingsContext.Provider
      value={{ theme, toggleTheme, colorTheme, setColorTheme, currency, setCurrency }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
