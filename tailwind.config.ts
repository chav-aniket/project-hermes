import type { Config } from "tailwindcss";
import colours from "tailwindcss/colors";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    colors: {
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
    extend: {},
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
