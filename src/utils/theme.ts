const THEME_COLORS = {
  light: "#fed7aa",
  dark: "#0f172a",
};

// Mapping of Tailwind fill classes to actual color values
// Used to freeze SVG fills during theme transitions (getComputedStyle().fill is unreliable)
const FILL_CLASS_MAP: Record<string, { light: string; dark: string }> = {
  "fill-tertiary": { light: "#ea580c", dark: "#cbd5e1" },
  "fill-primary": { light: "#fed7aa", dark: "#0f172a" },
  "fill-secondary": { light: "#fdba74", dark: "#475569" },
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
const PHASE_DURATION = 1000;
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
    // Mobile: wave reveal animation
    // Strategy: Capture styles from original DOM, clone body, apply styles to clone,
    // toggle real theme, then animate old-theme overlay away from top

    // Remove any existing overlay
    document.getElementById("theme-reveal-overlay")?.remove();

    // Capture computed styles from ORIGINAL elements (must be in DOM for getComputedStyle to work)
    // Exclude scripts and overlay so indices match after we remove them from clone
    const originalElements = Array.from(
      document.body.querySelectorAll("*:not(script):not(#theme-reveal-overlay)")
    );
    const styleMap = new Map<number, CSSStyleDeclaration>();
    originalElements.forEach((el, i) => {
      if (el instanceof HTMLElement) {
        styleMap.set(i, getComputedStyle(el));
      }
    });
    const bodyComputed = getComputedStyle(document.body);

    // Now clone the body
    const bodyClone = document.body.cloneNode(true) as HTMLElement;
    bodyClone
      .querySelectorAll("script, #theme-reveal-overlay")
      .forEach((el) => el.remove());

    // Apply captured styles to clone elements (by index - now matches since we excluded same elements)
    const cloneElements = Array.from(bodyClone.querySelectorAll("*"));
    cloneElements.forEach((el, i) => {
      if (styleMap.has(i)) {
        const computed = styleMap.get(i)!;
        if (el instanceof HTMLElement) {
          el.style.color = computed.color;
          el.style.backgroundColor = computed.backgroundColor;
          el.style.borderTopColor = computed.borderTopColor;
          el.style.borderRightColor = computed.borderRightColor;
          el.style.borderBottomColor = computed.borderBottomColor;
          el.style.borderLeftColor = computed.borderLeftColor;
          el.style.outlineColor = computed.outlineColor;
        }
      }
      // Handle SVG elements separately (SVGElement is not HTMLElement, so styleMap won't have them)
      // Map Tailwind fill classes to actual colors (getComputedStyle().fill is unreliable)
      if (el instanceof SVGElement) {
        const classes = el.getAttribute("class") || "";
        const isDark = document.documentElement.classList.contains("dark");

        // Find fill class and map to actual color value
        let fillColor: string | null = null;
        for (const [fillClass, colors] of Object.entries(FILL_CLASS_MAP)) {
          if (classes.includes(fillClass)) {
            fillColor = isDark ? colors.dark : colors.light;
            break;
          }
        }

        if (fillColor) {
          // Set fill on this element
          el.style.setProperty("fill", fillColor, "important");
          // Also set fill on all child shape elements (path, circle, rect, etc.)
          el.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline").forEach(child => {
            (child as SVGElement).style.setProperty("fill", fillColor!, "important");
          });
        }

        // Remove theme-reactive classes so they don't override our inline style
        const filteredClasses = classes
          .split(" ")
          .filter(c => !c.includes("fill-") && !c.startsWith("dark:"))
          .join(" ");
        el.setAttribute("class", filteredClasses);
      }
    });

    // Also freeze body clone itself
    bodyClone.style.color = bodyComputed.color;
    bodyClone.style.backgroundColor = bodyComputed.backgroundColor;

    // Create overlay with OLD theme background
    const overlay = document.createElement("div");
    overlay.id = "theme-reveal-overlay";
    overlay.style.backgroundColor = goingDark
      ? THEME_COLORS.light
      : THEME_COLORS.dark;

    // Position clone at 0,0 (full body clone)
    bodyClone.style.position = "absolute";
    bodyClone.style.top = "0";
    bodyClone.style.left = "0";
    bodyClone.style.width = "100%";
    bodyClone.style.margin = "0";
    overlay.appendChild(bodyClone);

    document.body.appendChild(overlay);

    // Toggle real theme IMMEDIATELY (page now has new colors underneath)
    html.classList.toggle("dark", goingDark);
    html.classList.add("theme-wave");

    // Animate clip-path: overlay shrinks from TOP, revealing new theme
    const duration = PHASE_DURATION;
    const startTime = performance.now();
    const amplitude = 3;

    const animateClip = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      // Wave Y: 0% -> 100% (wave moves DOWN, old theme shrinks from top)
      const waveY = eased * 100;

      // Polygon: area BELOW wave (old theme still visible there)
      const points: string[] = [];
      for (let x = 0; x <= 100; x += 5) {
        const wave = Math.sin((x / 100) * Math.PI * 4) * amplitude;
        points.push(`${x}% ${waveY + wave}%`);
      }
      points.push("100% 100%", "0% 100%");

      overlay.style.clipPath = `polygon(${points.join(", ")})`;

      if (progress < 1) {
        requestAnimationFrame(animateClip);
      }
    };

    requestAnimationFrame(animateClip);

    // Icon change early
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("theme-toggle-visual"));
    }, 100);

    // Cleanup
    setTimeout(() => {
      html.classList.remove("theme-wave");
      overlay.remove();
    }, PHASE_DURATION);
  } else {
    // Desktop: 4-phase transition with radial wave
    // Phase 1: Text shadows appear (midday overhead light)
    // Phase 2: Content melts, then radial wave reveals new theme
    // Phase 3: Content emerges with new theme
    // Phase 4: Shadows recede
    const MELT_DURATION = 300;
    const WAVE_DURATION = PHASE_DURATION;

    // Phase 1: Shadows appear (synced with toggle button animation)
    html.classList.add("theme-shadow-in");

    setTimeout(() => {
      // Pause after shadows appear
      html.classList.remove("theme-shadow-in");

      setTimeout(() => {
        // Phase 2a: Melt content (visible melt, no sweep yet)
        html.classList.add("theme-melt");

        setTimeout(() => {
          // Pause after melt, then radial wave
          html.classList.remove("theme-melt");
          html.classList.add("theme-hidden");

          setTimeout(() => {
            // Phase 2b: Radial wave from bottom-center
            // Remove any existing overlay
            document.getElementById("theme-reveal-overlay")?.remove();

            // Capture computed styles from ORIGINAL elements
            const originalElements = Array.from(
              document.body.querySelectorAll("*:not(script):not(#theme-reveal-overlay)")
            );
            const styleMap = new Map<number, CSSStyleDeclaration>();
            originalElements.forEach((el, i) => {
              if (el instanceof HTMLElement) {
                styleMap.set(i, getComputedStyle(el));
              }
            });
            const bodyComputed = getComputedStyle(document.body);

            // Clone the body
            const bodyClone = document.body.cloneNode(true) as HTMLElement;
            bodyClone
              .querySelectorAll("script, #theme-reveal-overlay")
              .forEach((el) => el.remove());

            // Apply captured styles to clone elements
            const cloneElements = Array.from(bodyClone.querySelectorAll("*"));
            cloneElements.forEach((el, i) => {
              if (styleMap.has(i)) {
                const computed = styleMap.get(i)!;
                if (el instanceof HTMLElement) {
                  el.style.color = computed.color;
                  el.style.backgroundColor = computed.backgroundColor;
                  el.style.borderTopColor = computed.borderTopColor;
                  el.style.borderRightColor = computed.borderRightColor;
                  el.style.borderBottomColor = computed.borderBottomColor;
                  el.style.borderLeftColor = computed.borderLeftColor;
                  el.style.outlineColor = computed.outlineColor;
                }
              }
              // Handle SVG elements separately (SVGElement is not HTMLElement, so styleMap won't have them)
              // Map Tailwind fill classes to actual colors (getComputedStyle().fill is unreliable)
              if (el instanceof SVGElement) {
                const classes = el.getAttribute("class") || "";
                const isDark = document.documentElement.classList.contains("dark");

                // Find fill class and map to actual color value
                let fillColor: string | null = null;
                for (const [fillClass, colors] of Object.entries(FILL_CLASS_MAP)) {
                  if (classes.includes(fillClass)) {
                    fillColor = isDark ? colors.dark : colors.light;
                    break;
                  }
                }

                if (fillColor) {
                  // Set fill on this element
                  el.style.setProperty("fill", fillColor, "important");
                  // Also set fill on all child shape elements (path, circle, rect, etc.)
                  el.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline").forEach(child => {
                    (child as SVGElement).style.setProperty("fill", fillColor!, "important");
                  });
                }

                // Remove theme-reactive classes so they don't override our inline style
                const filteredClasses = classes
                  .split(" ")
                  .filter(c => !c.includes("fill-") && !c.startsWith("dark:"))
                  .join(" ");
                el.setAttribute("class", filteredClasses);
              }
            });

            // Also freeze body clone itself
            bodyClone.style.color = bodyComputed.color;
            bodyClone.style.backgroundColor = bodyComputed.backgroundColor;

            // Create overlay with OLD theme background
            const overlay = document.createElement("div");
            overlay.id = "theme-reveal-overlay";
            overlay.style.cssText = `
              position: fixed;
              inset: 0;
              overflow: hidden;
              z-index: 9998;
              pointer-events: none;
              background-color: ${goingDark ? THEME_COLORS.light : THEME_COLORS.dark};
            `;

            // Position clone at 0,0 (full body clone)
            bodyClone.style.position = "absolute";
            bodyClone.style.top = "0";
            bodyClone.style.left = "0";
            bodyClone.style.width = "100%";
            bodyClone.style.margin = "0";
            overlay.appendChild(bodyClone);

            document.body.appendChild(overlay);

            // Toggle real theme IMMEDIATELY (page now has new colors underneath)
            html.classList.toggle("dark", goingDark);

            // Trigger the sun/moon visual change to animate with the wave
            window.dispatchEvent(new CustomEvent("theme-toggle-visual"));

            // Animate clip-path: arc sweeps clockwise from bottom-left to bottom-right
            // Center at bottom-middle, wedge shrinks as start angle moves from 270° to 90°
            const startTime = performance.now();
            const centerX = 50;
            const centerY = 100;
            const radius = 150; // % - large enough to cover viewport from bottom-center

            const animateArcClip = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / WAVE_DURATION, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

              // Wedge from startAngle (moving) to endAngle (fixed at 90°)
              // startAngle: 270° → 450° (=90°) over the animation
              const startAngleDeg = 270 + eased * 180;
              const endAngleDeg = 90;

              // Build polygon points: center + arc from startAngle to endAngle (clockwise)
              const points: string[] = [`${centerX}% ${centerY}%`];

              // Arc from startAngle to endAngle, going clockwise (increasing angle)
              // We go from startAngle up to 450 (which is 90° + 360°)
              for (let deg = startAngleDeg; deg <= 450; deg += 10) {
                const normalized = deg % 360;
                // Convert CSS angle (0°=up, clockwise) to math angle (0°=right, counter-clockwise)
                const rad = ((normalized - 90) * Math.PI) / 180;
                const x = centerX + radius * Math.cos(rad);
                const y = centerY + radius * Math.sin(rad);
                points.push(`${x}% ${y}%`);
              }

              // Ensure we end exactly at endAngle (90°)
              const endRad = ((endAngleDeg - 90) * Math.PI) / 180;
              points.push(
                `${centerX + radius * Math.cos(endRad)}% ${centerY + radius * Math.sin(endRad)}%`
              );

              overlay.style.clipPath =
                points.length > 2 ? `polygon(${points.join(", ")})` : "none";

              if (progress < 1) {
                requestAnimationFrame(animateArcClip);
              }
            };

            requestAnimationFrame(animateArcClip);

            // Cleanup wave overlay after animation
            setTimeout(() => {
              overlay.remove();
              html.classList.remove("theme-hidden");

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
            }, WAVE_DURATION);
          }, PAUSE_DURATION);
        }, MELT_DURATION);
      }, PAUSE_DURATION);
    }, SHADOW_IN_DURATION);
  }
};
