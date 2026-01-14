import type { Config } from "tailwindcss";
import colours from "tailwindcss/colors";

// Theme transition colors (inspired by jzhao.xyz sunlit effect)
// These create natural sunrise/sunset color progressions
const themeTransition = {
  day: "#fed7aa", // orange-200 (light theme)
  evening: "#fccc83", // golden hour
  dusk: "#db7a2a", // deep amber
  morning: "#9fb3bf", // soft blue-gray
  dawn: "#16132b", // dark purple
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
        // Sunrise: night → dawn → morning → day (1s, quick awakening)
        sunrise: {
          "0%": { backgroundColor: themeTransition.night },
          "10%": { backgroundColor: themeTransition.dawn },
          "35%": { backgroundColor: themeTransition.morning },
          "100%": { backgroundColor: themeTransition.day },
        },
        // Sunset: day → evening → dusk → dawn → night (1.7s, lingering golden hour)
        sunset: {
          "0%": { backgroundColor: themeTransition.day },
          "30%": { backgroundColor: themeTransition.evening },
          "60%": { backgroundColor: themeTransition.dusk },
          "90%": { backgroundColor: themeTransition.dawn },
          "100%": { backgroundColor: themeTransition.night },
        },
      },
      animation: {
        "wash-wave": "wash-wave 500ms ease-out forwards",
        sunrise: "sunrise 1s cubic-bezier(0.455, 0.19, 0, 0.985) forwards",
        sunset: "sunset 1.7s cubic-bezier(0.455, 0.19, 0, 0.985) forwards",
      },
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
