module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:   "#05111f",
        "navy-2": "#0a1929",
        "navy-3": "#0d1e30",
        brand:  "#1A6FE0",
        "brand-light": "#60a5fa",
        orange: "#F97316",
        cream:  "#e8edf5",
        ok:     "#16A34A",
        warn:   "#D97706",
        bad:    "#DC2626",
        muted:  "rgba(232,237,245,0.45)",
        border: "rgba(255,255,255,0.08)",
        surface:"rgba(255,255,255,0.04)",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "2rem",
      },
    },
  },
};
