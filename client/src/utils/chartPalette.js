// A categorical color sequence derived entirely from the active theme's
// CSS variables, so every chart re-colors itself the instant the theme or
// light/dark mode changes — instead of relying on a flat hex stored per
// category/goal at creation time, which stays fixed no matter what theme
// is active later and can clash badly (e.g. a "sage" swatch chosen under
// Matcha Morning showing up unchanged under Forest Noir).
const PALETTE = [
  "var(--primary)",
  "var(--secondary)",
  "var(--tertiary)",
  "color-mix(in srgb, var(--primary) 55%, var(--secondary) 45%)",
  "color-mix(in srgb, var(--secondary) 55%, var(--tertiary) 45%)",
  "color-mix(in srgb, var(--tertiary) 55%, var(--primary) 45%)",
  "color-mix(in srgb, var(--primary) 65%, var(--surface-highest) 35%)",
  "color-mix(in srgb, var(--secondary) 65%, var(--surface-highest) 35%)",
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Pass a category/goal id (number or string) or a plain index — same key
// always maps to the same palette slot, so a given category keeps a
// consistent color across the pie chart, bar breakdowns, etc.
export function themedColor(key) {
  const n = typeof key === "number" ? key : hashString(String(key ?? ""));
  return PALETTE[n % PALETTE.length];
}

export const CHART_PALETTE = PALETTE;
