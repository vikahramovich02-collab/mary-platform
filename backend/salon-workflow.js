// Исполнимый минимальный workflow «Запись из Direct» из гайда Mary.
// Внешние каналы намеренно заменены адаптерами: Instagram/Telegram вызывает этот
// модуль с текстом сообщения, а отправку ответа забирает вызывающая интеграция.

const SERVICES = {
  "маникюр": { durationMin: 40, price: 35 },
  "педикюр": { durationMin: 60, price: 50 },
  "стрижка": { durationMin: 40, price: 40 },
  "брови": { durationMin: 30, price: 25 },
};

const MASTERS = [
  { id: "katya", name: "Катя", services: ["маникюр", "педикюр", "брови"] },
  { id: "lena", name: "Лена", services: ["маникюр", "стрижка", "брови"] },
];

function dayFrom(input, now) {
  if (/сегодня/i.test(input)) return now.slice(0, 10);
  const d = new Date(`${now.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function serviceFrom(input) {
  const normalized = input.toLowerCase();
  return Object.keys(SERVICES).find(service => normalized.includes(service)) || null;
}

function timeFrom(input) {
  const match = input.match(/\b([01]?\d|2[0-3])(?:[:.]([0-5]\d))?\b/);
  return match ? `${match[1].padStart(2, "0")}:${match[2] || "00"}` : null;
}

function nameFrom(input) {
  const match = input.match(/(?:меня зовут|имя|,\s*)([А-ЯЁ][а-яё-]{2,})/u);
  return match?.[1] || null;
}

function isTaken(bookings, startsAt, masterId) {
  return bookings.some(b => b.startsAt === startsAt && b.masterId === masterId && b.status === "confirmed");
}

export function getAvailableSlots({ service, date, bookings = [] }) {
  if (!SERVICES[service]) return [];
  const hours = ["18:00", "18:30", "19:00"];
  return MASTERS
    .filter(master => master.services.includes(service))
    .flatMap(master => hours.map(time => ({ master, startsAt: `${date}T${time}:00` })))
    .filter(slot => !isTaken(bookings, slot.startsAt, slot.master.id));
}

export function runSalonBooking({ message, bookings = [], now = new Date().toISOString(), clientId = "direct" }) {
  const service = serviceFrom(message);
  if (!service) {
    return { status: "needs_service", reply: "Подскажите, пожалуйста, на какую услугу хотите записаться?" };
  }

  const date = dayFrom(message, now);
  const requestedTime = timeFrom(message);
  const clientName = nameFrom(message);
  const slots = getAvailableSlots({ service, date, bookings });

  if (!requestedTime || !clientName) {
    const options = slots.slice(0, 3).map(s => `${s.startsAt.slice(11, 16)} к ${s.master.name}`).join(", ");
    return {
      status: "awaiting_choice",
      service,
      date,
      slots,
      reply: `Конечно 💅 На ${date} для «${service}» есть: ${options}. Напишите удобное время и имя — забронирую.`,
    };
  }

  const selected = slots.find(s => s.startsAt.slice(11, 16) === requestedTime);
  if (!selected) {
    return {
      status: "slot_unavailable",
      service,
      date,
      slots,
      reply: `На ${requestedTime} уже нет свободного окна. Могу предложить: ${slots.slice(0, 3).map(s => `${s.startsAt.slice(11, 16)} к ${s.master.name}`).join(", ")}.`,
    };
  }

  const appointment = {
    id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    clientId,
    clientName,
    service,
    masterId: selected.master.id,
    masterName: selected.master.name,
    startsAt: selected.startsAt,
    status: "confirmed",
    reminderStatus: "pending",
    createdAt: now,
  };
  return {
    status: "confirmed",
    appointment,
    reply: `${clientName}, записала вас на ${service} ${date} в ${requestedTime} к ${selected.master.name} 🌸 Накануне напомню. Если планы поменяются — просто напишите.`,
  };
}

export function collectReminders({ bookings = [], now = new Date().toISOString() }) {
  const nowMs = Date.parse(now);
  return bookings
    .filter(b => b.status === "confirmed" && b.reminderStatus === "pending")
    .filter(b => {
      const hoursToVisit = (Date.parse(b.startsAt) - nowMs) / 3_600_000;
      return hoursToVisit > 0 && hoursToVisit <= 48;
    })
    .map(b => ({ appointmentId: b.id, clientId: b.clientId, text: `${b.clientName}, напоминаю: завтра у вас ${b.service} в ${b.startsAt.slice(11, 16)} у мастера ${b.masterName}. Подтвердите, пожалуйста: да / перенести.` }));
}
