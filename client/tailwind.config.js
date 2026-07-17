/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Every value below is a CSS custom property redefined per
      // [data-color-theme] in index.css, so an unchanged className like
      // "font-serif" or "rounded-xl" renders differently per theme without
      // any component edits.
      fontFamily: {
        serif: "var(--font-heading)",
        sans: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        sm: "var(--radius-1)",
        DEFAULT: "var(--radius-2)",
        md: "var(--radius-3)",
        lg: "var(--radius-4)",
        xl: "var(--radius-5)",
        "2xl": "var(--radius-2)",
        "3xl": "var(--radius-3)",
        full: "var(--radius-pill)",
      },
      spacing: {
        "container-padding": "var(--container-padding)",
        "widget-gap": "var(--widget-gap)",
      },
      boxShadow: {
        soft: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        lifted: "var(--shadow-lg)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        DEFAULT: "var(--dur-med)",
        slow: "var(--dur-slow)",
      },
      transitionTimingFunction: {
        theme: "var(--ease)",
      },
    },
  },
  plugins: [],
};
