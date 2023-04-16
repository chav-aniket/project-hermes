export const setTheme = () => {
  const userTheme = localStorage.theme;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (userTheme === "dark" || (!("theme" in localStorage) && systemTheme)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const isDarkTheme = () => {
  return (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
};

export const setLight = () => {
  localStorage.theme = "light";
};

export const setDark = () => {
  localStorage.theme = "dark";
};

export const toggleTheme = () => {
  const theme = localStorage.theme;
  if (theme === "dark") {
    setLight();
    setTheme();
  } else {
    setDark();
    setTheme();
  }
};
