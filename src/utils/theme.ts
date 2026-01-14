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

// Animation durations (must match CSS variables)
const PHASE_DURATION = 600;
const SHADOW_IN_DURATION = 400; // Faster to sync with toggle button animation (500ms)
const PAUSE_DURATION = 250; // Pause between steps for audience to catch up
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
    // Desktop: 4-phase transition
    // Phase 1: Text shadows appear (midday overhead light)
    // Phase 2: Content melts, then hidden + color sweeps
    // Phase 3: Content emerges with new theme
    // Phase 4: Shadows recede
    const animationClass = goingDark ? "theme-sunset" : "theme-sunrise";
    const MELT_DURATION = 300;
    const SWEEP_DURATION = PHASE_DURATION - MELT_DURATION;

    // Phase 1: Shadows appear (synced with toggle button animation)
    html.classList.add("theme-shadow-in");

    setTimeout(() => {
      // Pause after shadows appear
      html.classList.remove("theme-shadow-in");

      setTimeout(() => {
        // Phase 2a: Melt content (visible melt, no sweep yet)
        html.classList.add("theme-melt");

        setTimeout(() => {
          // Pause after melt, then sweep
          html.classList.remove("theme-melt");
          html.classList.add("theme-hidden");

          setTimeout(() => {
            // Phase 2b: Sweep starts
            html.classList.add(animationClass);

            // Trigger the sun/moon visual change to animate with the sweep
            window.dispatchEvent(new CustomEvent("theme-toggle-visual"));

            setTimeout(() => {
              // Toggle theme at END of sweep (when it covers the page)
              html.classList.toggle("dark", goingDark);

              // Phase 3: Unmelt (sweep class removed so ::after disappears)
              html.classList.remove("theme-hidden", animationClass);

              setTimeout(() => {
                html.classList.add("theme-unmelt");

                setTimeout(() => {
                  // Pause after unmelt
                  html.classList.remove("theme-unmelt");

                  setTimeout(() => {
                    // Phase 4: Shadows fade out
                    html.classList.add("theme-shadow-out");

                    setTimeout(() => {
                      // Clean up
                      html.classList.remove("theme-shadow-out");
                    }, PHASE_DURATION);
                  }, PAUSE_DURATION);
                }, PHASE_DURATION);
              }, PAUSE_DURATION);
            }, SWEEP_DURATION);
          }, PAUSE_DURATION);
        }, MELT_DURATION);
      }, PAUSE_DURATION);
    }, SHADOW_IN_DURATION);
  }
};
