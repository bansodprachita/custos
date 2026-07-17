// Given an arbitrary hex color (e.g. a user-picked category color), returns
// either near-white or near-black — whichever gives better contrast. Category
// colors are fully user-customizable, so a hardcoded white icon would go
// invisible against any light color the user picks (pale yellow, mint, etc).
export function readableOn(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  // Relative luminance (WCAG formula)
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.45 ? "#241C12" : "#FFFFFF";
}
