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

const WASH_DURATION = 500;

export const toggleTheme = () => {
  const html = document.documentElement;
  const goingDark = localStorage.theme !== "dark";

  // Update theme-color immediately so status bar animates with wash
  updateThemeColor(goingDark);

  // Start wash animation
  html.classList.add("theme-wash");

  // At end of animation, switch the actual theme and clean up
  setTimeout(() => {
    if (goingDark) {
      setDark();
    } else {
      setLight();
    }
    html.classList.toggle("dark", goingDark);
    html.classList.remove("theme-wash");
  }, WASH_DURATION);
};
