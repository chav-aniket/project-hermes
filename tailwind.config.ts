import type { Config } from "tailwindcss";
import colours from "tailwindcss/colors";


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
    },
    extend: {
      keyframes: {
        // Mobile: wave wash from top (for iOS status bar sync)
        "wash-wave": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "wash-wave": "wash-wave 400ms ease-out forwards",
      },
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
