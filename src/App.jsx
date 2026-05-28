import { useState, useEffect } from "react";
import { ThemeContext } from "./ui/theme.js";
import TgKanalPage from "./platform/pages/TgKanalPage";

export default function App() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("mary_theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "";
    try { localStorage.setItem("mary_theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <TgKanalPage />
    </ThemeContext.Provider>
  );
}
