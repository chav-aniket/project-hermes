const THEME_COLORS = {
  light: "#fed7aa",
  dark: "#0f172a",
};

const updateThemeColor = (isDark: boolean) => {
  const color = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
};

export const setTheme = () => {
  const userTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = userTheme === "dark" || (!userTheme && systemTheme);
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  updateThemeColor(isDark);
};

// Inline script for immediate execution before page render (prevents flash)
// This is a string that can be injected into a <script> tag
export const initThemeScript = `(function(){
  var t=localStorage.getItem("theme");
  var s=window.matchMedia("(prefers-color-scheme: dark)").matches;
  var d=t==="dark"||(!t&&s);
  if(d){document.documentElement.classList.add("dark")}
  else{document.documentElement.classList.remove("dark")}
  var m=document.querySelector('meta[name="theme-color"]');
  if(m)m.setAttribute("content",d?"#0f172a":"#fed7aa");
})();`;

export const isDarkTheme = () => {
  // Check the actual DOM state rather than re-computing from localStorage/system
  // This ensures the toggle always matches what's visually displayed
  return document.documentElement.classList.contains("dark");
};

export const setLight = () => {
  localStorage.theme = "light";
};

export const setDark = () => {
  localStorage.theme = "dark";
};

// Animation durations (must match CSS variables in Layout.astro)
const MOBILE_WAVE_DURATION = 500;
const SUNRISE_DURATION = 1000;
const SUNSET_DURATION = 1700;
const MELT_DURATION = 300;
const REVEAL_DURATION = 400;
const MOBILE_BREAKPOINT = 768;

const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const toggleTheme = () => {
  const html = document.documentElement;
  const goingDark = localStorage.theme !== "dark";

  // Update theme-color for status bar
  updateThemeColor(goingDark);

  // Update localStorage immediately
  if (goingDark) {
    setDark();
  } else {
    setLight();
  }

  if (isMobile()) {
    // Mobile: wave overlay animation (syncs with iOS status bar)
    html.classList.add("theme-wave");

    setTimeout(() => {
      html.classList.toggle("dark", goingDark);
      html.classList.remove("theme-wave");
    }, MOBILE_WAVE_DURATION);
  } else {
    // Desktop: three-phase transition (inspired by jzhao.xyz sunlit)
    // Phase 1: Melt - components fade into background
    // Phase 2: Background transitions through sunrise/sunset colors
    // Phase 3: Reveal - components fade back in with new theme
    const animationClass = goingDark ? "theme-sunset" : "theme-sunrise";
    const bgDuration = goingDark ? SUNSET_DURATION : SUNRISE_DURATION;

    // Phase 1: Melt
    html.classList.add("theme-melt");

    setTimeout(() => {
      // Phase 2: Hidden + background animation + theme switch
      html.classList.remove("theme-melt");
      html.classList.add("theme-hidden", animationClass);
      html.classList.toggle("dark", goingDark);

      setTimeout(() => {
        // Phase 3: Reveal
        html.classList.remove("theme-hidden", animationClass);
        html.classList.add("theme-reveal");

        setTimeout(() => {
          // Clean up
          html.classList.remove("theme-reveal");
        }, REVEAL_DURATION);
      }, bgDuration);
    }, MELT_DURATION);
  }
};
