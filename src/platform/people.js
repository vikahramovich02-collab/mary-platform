// Единый источник людей платформы (загружается с backend /api/mary/team/people).
// Извлечено из TgKanalPage.jsx (Phase 1 refactor).
import { useState, useEffect } from "react";

// Module-level кэш + listener-pattern
let CACHED_PEOPLE = [];
const peopleListeners = new Set();

function loadPeopleOnce() {
  if (loadPeopleOnce._loading || CACHED_PEOPLE.length > 0) return;
  loadPeopleOnce._loading = true;
  fetch("/api/mary/team/people").then(r => r.json()).then(d => {
    CACHED_PEOPLE = (d.people || []).map(p => ({
      ...p,
      // алиасы для обратной совместимости со старым кодом
      role: p.acl || p.role,           // 'approver' / 'member' для PeopleContent
      handle: p.handle || `@${p.id}`,
      title: p.title || p.role,
      lastActive: p.lastActive || (p.isMe ? "сейчас online" : "недавно"),
    }));
    peopleListeners.forEach(fn => fn(CACHED_PEOPLE));
  }).catch(() => {}).finally(() => { loadPeopleOnce._loading = false; });
}

// Hook: подписывается на обновление кэша; возвращает текущий список
export function usePeople() {
  const [people, setPeople] = useState(CACHED_PEOPLE);
  useEffect(() => {
    if (CACHED_PEOPLE.length === 0) loadPeopleOnce();
    const fn = (p) => setPeople(p);
    peopleListeners.add(fn);
    return () => peopleListeners.delete(fn);
  }, []);
  return people;
}

// Минимальный fallback пока backend не ответил — чтобы UI не падал
export const MOCK_PEOPLE = [
  { id: "vika",  name: "Виктория Ахрамович", handle: "@vika",      role: "approver", title: "Head of SMM",  color: "#8A38F5", isMe: true },
  { id: "alex",  name: "Александр Орлов",    handle: "@a.orlov",   role: "approver", title: "Бекенд-лид",   color: "#3F95FF" },
  { id: "maria", name: "Мария Дудник",       handle: "@m.dudnik",  role: "member",   title: "Дизайнер",     color: "#FF6FB3" },
  { id: "ivan",  name: "Иван Соколов",       handle: "@i.sokolov", role: "approver", title: "Маркетинг",    color: "#FF8B3D" },
  { id: "katya", name: "Катя Сафина",        handle: "@k.safina",  role: "member",   title: "Контент",      color: "#7A86FF" },
];
