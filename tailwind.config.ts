import type { Config } from "tailwindcss";
import colours from "tailwindcss/colors";

// Theme transition colors - simplified for smoother, faster transitions
const themeTransition = {
  day: "#fed7aa", // orange-200 (light theme)
  golden: "#e9a865", // warm midpoint
  twilight: "#4a5568", // cool gray midpoint
  night: "#0f172a", // slate-900 (dark theme)
};

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
      // Include standard colors needed by components
      gray: colours.gray,
      white: colours.white,
      transparent: "transparent",
      // Custom theme colors
      primary: {
        DEFAULT: colours.slate[900],
        light: colours.orange[200],
        dark: colours.slate[900],
      },
      secondary: {
        DEFAULT: colours.slate[600],
        light: colours.orange[300],
        dark: colours.slate[600],
      },
      tertiary: {
        DEFAULT: colours.slate[300],
        light: colours.orange[600],
        dark: colours.slate[300],
      },
      textLight: {
        DEFAULT: colours.gray[700],
      },
      textDark: {
        DEFAULT: colours.gray[300],
      },
      // Theme transition colors for animations
      transition: themeTransition,
    },
    extend: {
      keyframes: {
        // Mobile: wave wash from top (for iOS status bar sync)
        "wash-wave": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        // Sunrise: night → twilight → golden → day (fast, smooth)
        sunrise: {
          "0%": { backgroundColor: themeTransition.night },
          "40%": { backgroundColor: themeTransition.twilight },
          "70%": { backgroundColor: themeTransition.golden },
          "100%": { backgroundColor: themeTransition.day },
        },
        // Sunset: day → golden → twilight → night (smooth descent)
        sunset: {
          "0%": { backgroundColor: themeTransition.day },
          "30%": { backgroundColor: themeTransition.golden },
          "60%": { backgroundColor: themeTransition.twilight },
          "100%": { backgroundColor: themeTransition.night },
        },
      },
      animation: {
        "wash-wave": "wash-wave 400ms ease-out forwards",
        sunrise: "sunrise 500ms ease-in-out forwards",
        sunset: "sunset 600ms ease-in-out forwards",
      },
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
