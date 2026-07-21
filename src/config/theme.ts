/**
 * Shared theme configuration - single source of truth for colors and timing.
 * Used by both JS animations and injected as CSS custom properties.
 */

export const THEME_COLORS = {
  light: "#fed7aa", // orange-200
  dark: "#0f172a", // slate-900
} as const;

// Fill colors for SVG elements (must match Tailwind config)
export const FILL_COLORS = {
  tertiary: { light: "#ea580c", dark: "#cbd5e1" }, // orange-600 / slate-300
  primary: { light: "#fed7aa", dark: "#0f172a" }, // orange-200 / slate-900
  secondary: { light: "#fdba74", dark: "#475569" }, // orange-300 / slate-600
} as const;

export const TIMING = {
  phase: 2000, // Theme transition duration (keep in sync with --arc-duration)
  pause: 300,
} as const;

export const BREAKPOINTS = {
  mobile: 768,
} as const;

// Wave animation constants
export const WAVE = {
  amplitude: 3,
  step: 5,
} as const;

export const ARC = {
  radius: 150,
  step: 10,
} as const;

// Helper to check if we're on mobile
export const isMobile = () => window.innerWidth < BREAKPOINTS.mobile;

// Promise-based delay for cleaner async animations
export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
