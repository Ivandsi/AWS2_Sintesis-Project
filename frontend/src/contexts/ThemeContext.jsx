import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

export function ThemeProvider({ children }) {
  // Initialize theme from cookie or default to "system"
  const [theme, setTheme] = useState(() => getCookie("theme") || "system");

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    // Function to update the theme classes on root element
    const updateThemeClass = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldBeDark = theme === "dark" || (theme === "system" && prefersDark);

      root.classList.toggle("dark", shouldBeDark);
    };

    // Initial call to set theme
    updateThemeClass();

    // Save theme in cookie
    setCookie("theme", theme);

    // If theme is "system", listen for changes in system preference
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        updateThemeClass();
      };

      // Add listener
      mediaQuery.addEventListener
        ? mediaQuery.addEventListener("change", handleChange)
        : mediaQuery.addListener(handleChange); // fallback for older browsers

      // Cleanup listener on unmount or when theme changes
      return () => {
        mediaQuery.removeEventListener
          ? mediaQuery.removeEventListener("change", handleChange)
          : mediaQuery.removeListener(handleChange);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
