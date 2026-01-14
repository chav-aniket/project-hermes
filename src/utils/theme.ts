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

// Animation durations (must match CSS --phase-duration)
const PHASE_DURATION = 600;
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
    }, PHASE_DURATION);
  } else {
    // Desktop: 4-phase transition (600ms each = 2.4s total)
    // Phase 1: Strong midday shadows appear
    // Phase 2: Content melts + color sweep across page
    // Phase 3: Content emerges
    // Phase 4: Shadows recede
    const animationClass = goingDark ? "theme-sunset" : "theme-sunrise";

    // Phase 1: Shadows appear
    html.classList.add("theme-shadow-in");

    setTimeout(() => {
      // Phase 2: Melt + color sweep + theme switch
      html.classList.remove("theme-shadow-in");
      html.classList.add("theme-melt", animationClass);
      html.classList.toggle("dark", goingDark);

      setTimeout(() => {
        // Phase 3: Unmelt
        html.classList.remove("theme-melt", animationClass);
        html.classList.add("theme-unmelt");

        setTimeout(() => {
          // Phase 4: Shadows fade out
          html.classList.remove("theme-unmelt");
          html.classList.add("theme-shadow-out");

          setTimeout(() => {
            // Clean up
            html.classList.remove("theme-shadow-out");
          }, PHASE_DURATION);
        }, PHASE_DURATION);
      }, PHASE_DURATION);
    }, PHASE_DURATION);
  }
};
