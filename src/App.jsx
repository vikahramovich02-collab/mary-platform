import { useState, useEffect } from "react";
import Onboarding from "./onboarding/Onboarding";
import Platform from "./platform/Platform";
import TgKanalPage from "./platform/pages/TgKanalPage";

// Роутер: landing → onboarding → platform
// Лендинг = public/landing.html (standalone)
// При переходе с лендинга — URL ?start=1 или hash #start
// Можно также зайти напрямую на / — покажет онбординг

export default function App() {
  // Прямой вход на отдельную страницу по ?page=tg-kanal — минует онбординг и Platform.
  if (window.location.search.indexOf("page=tg-kanal") >= 0) {
    return <TgKanalPage />;
  }

  var _s = useState(function() {
    // Если есть ?platform=1 или сохранено в localStorage — сразу платформа
    if (window.location.search.indexOf("platform=1") >= 0) return "platform";
    try { if (localStorage.getItem("mary_onboarded") === "1") return "platform"; } catch(e) {}
    return "onboarding";
  });
  var screen = _s[0]; var setScreen = _s[1];

  function handleOnboardingDone() {
    try { localStorage.setItem("mary_onboarded", "1"); } catch(e) {}
    setScreen("platform");
  }

  function handleReset() {
    try { localStorage.removeItem("mary_onboarded"); } catch(e) {}
    setScreen("onboarding");
  }

  if (screen === "onboarding") {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  return <Platform />;
}
