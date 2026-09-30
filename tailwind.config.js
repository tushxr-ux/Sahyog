module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy:    "#0B2A55",
        brand:   "#1A6FE0",
        "brand-hover": "#1560C0",
        orange:  "#F97316",
        "orange-hover": "#E86400",
        cream:   "#FAF7F4",
        surface: "#FFFFFF",
        ok:      "#16A34A",
        warn:    "#D97706",
        bad:     "#DC2626",
        muted:   "#6B7280",
        border:  "#E5E7EB",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(11,42,85,0.06), 0 4px 16px 0 rgba(11,42,85,0.06)",
        "card-hover": "0 4px 24px 0 rgba(11,42,85,0.12)",
        modal: "0 20px 60px 0 rgba(11,42,85,0.20)",
      },
      keyframes: {
        "count-up": { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "slide-up": { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        "fade-in":  { from: { opacity: 0 }, to: { opacity: 1 } },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(1.6)", opacity: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease both",
        "fade-in":  "fade-in 0.25s ease both",
        "pulse-ring": "pulse-ring 1.4s ease-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
        "count-up": "count-up 0.4s ease both",
      },
    },
  },
};
