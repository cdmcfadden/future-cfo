import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#05060a",
        surface: "#0b0d14",
        surface2: "#121522",
        line: "#1d2234",
        accent: "#7cf0ff",
        accent2: "#a78bfa",
        accent3: "#f472b6",
        nyse: "#e5786f",
        muted: "#8a93a6",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
      },
      animation: {
        "gradient-slow": "gradient 18s ease infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.8s ease-out forwards",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(124, 240, 255, 0.4)",
        "glow-violet": "0 0 60px -15px rgba(167, 139, 250, 0.5)",
        "glow-nyse": "0 0 60px -10px rgba(229, 120, 111, 0.55)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
