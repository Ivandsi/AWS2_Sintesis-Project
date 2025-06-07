
import { useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function DarkModeSwitch() {
  const { theme, setTheme } = useContext(ThemeContext);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="dark-mode-switch"
      aria-label="Cambiar tema"
    >
      <span className="icon-wrapper">
        {isDark ? (
          // Icono de sol (modo claro)
          <svg className="icon" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 12h2" stroke="currentColor" strokeWidth="2" />
            <path d="M20 12h2" stroke="currentColor" strokeWidth="2" />
            <path
              d="m4.93 4.93 1.41 1.41"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m17.66 17.66 1.41 1.41"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m6.34 17.66-1.41 1.41"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m19.07 4.93-1.41 1.41"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ) : (
          // Icono de luna (modo oscuro)
          <svg className="icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
