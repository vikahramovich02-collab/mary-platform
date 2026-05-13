import TgKanalPage from "./platform/pages/TgKanalPage";

// Единственная страница приложения — наша платформа.
// Внутри TgKanalPage свой роутер: ?page=chat-mary | tg-kanal | kb | tasks | ...
export default function App() {
  return <TgKanalPage />;
}
