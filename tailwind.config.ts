import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: "#5E6AD2",
        "brand-hover": "#4F5BBF",
        status: {
          bookmarked: "#7C3AED",
          applied: "#3B82F6",
          phone: "#F59E0B",
          interview: "#F97316",
          offer: "#10B981",
          rejected: "#EF4444",
          withdrawn: "#6B7280",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
