module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:    "#1a1f36",
        "navy-2":"#2d3361",
        brand:   "#F97316",
        "brand-hover": "#ea6c0a",
        "brand-light": "#fdba74",
        blue:    "#1A6FE0",
        "blue-light":"#93c5fd",
        cream:   "#fffbf7",
        surface: "#ffffff",
        ok:      "#16A34A",
        warn:    "#D97706",
        bad:     "#DC2626",
        muted:   "#6b7a99",
        border:  "#e8edf5",
        "border-dark": "#d1d9e8",
      },
      fontFamily: { sans: ["'Inter'", "system-ui", "sans-serif"] },
      borderRadius: { "2xl":"1rem","3xl":"1.25rem","4xl":"2rem" },
      boxShadow: {
        card:      "0 1px 3px rgba(26,31,54,0.06), 0 4px 16px rgba(26,31,54,0.06)",
        "card-lg": "0 4px 24px rgba(26,31,54,0.10)",
        orange:    "0 4px 20px rgba(249,115,22,0.28)",
        "orange-lg":"0 6px 32px rgba(249,115,22,0.38)",
      },
    },
  },
};
