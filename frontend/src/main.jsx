import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeContext, ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";

// Un wrapper para inyectar la clase dark directamente en el #root
function AppWithTheme() {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <div id="root-container" className={isDarkMode ? "dark" : ""}>
      <App />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppWithTheme />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
