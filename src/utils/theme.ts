import {
  THEME_COLORS,
  FILL_COLORS,
  TIMING,
  WAVE,
  ARC,
  isMobile,
  delay,
} from "@config/theme";

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
// Note: This must be a self-contained string (can't import from config)
export const initThemeScript = `(function(){
  var t=localStorage.getItem("theme");
  var s=window.matchMedia("(prefers-color-scheme: dark)").matches;
  var d=t==="dark"||(!t&&s);
  if(d){document.documentElement.classList.add("dark")}
  else{document.documentElement.classList.remove("dark")}
  var m=document.querySelector('meta[name="theme-color"]');
  if(m)m.setAttribute("content",d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}");
})();`;

export const isDarkTheme = () => {
  return document.documentElement.classList.contains("dark");
};

export const setLight = () => {
  localStorage.theme = "light";
};

export const setDark = () => {
  localStorage.theme = "dark";
};

/**
 * Creates a theme overlay with a frozen snapshot of the current page.
 * Used to show the "old" theme while the real page switches underneath.
 */
function createThemeOverlay(goingDark: boolean): HTMLElement {
  const currentIsDark = document.documentElement.classList.contains("dark");

  // Capture computed styles from original elements
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
    const computed = styleMap.get(i);
    if (computed && el instanceof HTMLElement) {
      el.style.color = computed.color;
      el.style.backgroundColor = computed.backgroundColor;
      el.style.borderTopColor = computed.borderTopColor;
      el.style.borderRightColor = computed.borderRightColor;
      el.style.borderBottomColor = computed.borderBottomColor;
      el.style.borderLeftColor = computed.borderLeftColor;
      el.style.outlineColor = computed.outlineColor;
    }

    // Handle SVG elements - map Tailwind fill classes to actual colors
    if (el instanceof SVGElement) {
      const classes = el.getAttribute("class") ?? "";
      let fillColor: string | null = null;

      // Match exact fill class names (word boundary matching)
      for (const [key, colors] of Object.entries(FILL_COLORS)) {
        const fillClass = `fill-${key}`;
        // Use word boundary check to avoid matching partial class names
        const classRegex = new RegExp(`\\b${fillClass}\\b`);
        if (classRegex.test(classes)) {
          fillColor = currentIsDark ? colors.dark : colors.light;
          break;
        }
      }

      if (fillColor) {
        el.style.setProperty("fill", fillColor, "important");
        // Also set fill on child shape elements
        el.querySelectorAll("path, circle, rect, polygon, ellipse, line, polyline").forEach((child) => {
          (child as SVGElement).style.setProperty("fill", fillColor, "important");
        });
      }

      // Remove theme-reactive classes
      const filteredClasses = classes
        .split(/\s+/)
        .filter((c) => !(c.startsWith("fill-") || c.startsWith("dark:")))
        .join(" ");
      el.setAttribute("class", filteredClasses);
    }
  });

  // Freeze body clone colors
  bodyClone.style.color = bodyComputed.color;
  bodyClone.style.backgroundColor = bodyComputed.backgroundColor;

  // Create overlay with OLD theme background
  const overlay = document.createElement("div");
  overlay.id = "theme-reveal-overlay";
  overlay.style.backgroundColor = goingDark
    ? THEME_COLORS.light
    : THEME_COLORS.dark;

  // Position clone to match current scroll position
  bodyClone.style.position = "absolute";
  bodyClone.style.top = `-${window.scrollY}px`;
  bodyClone.style.left = "0";
  bodyClone.style.width = "100%";
  bodyClone.style.margin = "0";
  overlay.appendChild(bodyClone);

  return overlay;
}

/**
 * Animates a wave-shaped clip-path from top to bottom.
 */
function animateWaveClip(overlay: HTMLElement, duration: number): void {
  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    const waveY = eased * 100;
    const points: string[] = [];

    for (let x = 0; x <= 100; x += WAVE.step) {
      const wave = Math.sin((x / 100) * Math.PI * 4) * WAVE.amplitude;
      points.push(`${x}% ${waveY + wave}%`);
    }
    points.push("100% 100%", "0% 100%");

    overlay.style.clipPath = `polygon(${points.join(", ")})`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Animates an arc-shaped clip-path sweeping from bottom-left to bottom-right.
 */
function animateArcClip(overlay: HTMLElement, duration: number): void {
  const startTime = performance.now();
  const centerX = 50;
  const centerY = 100;

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    // Wedge from startAngle (moving) to endAngle (fixed at 90°)
    const startAngleDeg = 270 + eased * 180;
    const endAngleDeg = 90;

    const points: string[] = [`${centerX}% ${centerY}%`];

    // Arc from startAngle to endAngle (clockwise)
    for (let deg = startAngleDeg; deg <= 450; deg += ARC.step) {
      const normalized = deg % 360;
      const rad = ((normalized - 90) * Math.PI) / 180;
      const x = centerX + ARC.radius * Math.cos(rad);
      const y = centerY + ARC.radius * Math.sin(rad);
      points.push(`${x}% ${y}%`);
    }

    // End exactly at endAngle
    const endRad = ((endAngleDeg - 90) * Math.PI) / 180;
    points.push(
      `${centerX + ARC.radius * Math.cos(endRad)}% ${centerY + ARC.radius * Math.sin(endRad)}%`
    );

    overlay.style.clipPath = points.length > 2 ? `polygon(${points.join(", ")})` : "none";

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Mobile theme transition with wave reveal animation.
 */
async function mobileTransition(html: HTMLElement, goingDark: boolean): Promise<void> {
  document.getElementById("theme-reveal-overlay")?.remove();

  const overlay = createThemeOverlay(goingDark);
  document.body.appendChild(overlay);

  // Toggle theme immediately (new colors underneath)
  html.classList.toggle("dark", goingDark);
  html.classList.add("theme-wave");

  // Start wave animation
  animateWaveClip(overlay, TIMING.phase);

  // Icon change early
  await delay(100);
  window.dispatchEvent(new CustomEvent("theme-toggle-visual"));

  // Cleanup after animation
  await delay(TIMING.phase - 100);
  html.classList.remove("theme-wave");
  overlay.remove();
}

/**
 * Desktop theme transition with arc sweep and CSS-driven shadow animation.
 * The `theme-arc-animating` class triggers CSS @keyframes for shadows.
 */
async function desktopTransition(html: HTMLElement, goingDark: boolean): Promise<void> {
  document.getElementById("theme-reveal-overlay")?.remove();
  const overlay = createThemeOverlay(goingDark);
  document.body.appendChild(overlay);

  // Toggle theme immediately (new colors underneath)
  html.classList.toggle("dark", goingDark);
  window.dispatchEvent(new CustomEvent("theme-toggle-visual"));

  // Trigger CSS animation for shadows
  html.classList.add("theme-arc-animating");

  // Run arc sweep (JS still needed for clip-path animation)
  animateArcClip(overlay, TIMING.phase);

  await delay(TIMING.phase);

  overlay.remove();
  html.classList.remove("theme-arc-animating");
}

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

  // Run appropriate transition (fire-and-forget)
  if (isMobile()) {
    mobileTransition(html, goingDark);
  } else {
    desktopTransition(html, goingDark);
  }
};
