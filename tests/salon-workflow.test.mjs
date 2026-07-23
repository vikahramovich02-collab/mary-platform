import test from "node:test";
import assert from "node:assert/strict";
import { runSalonBooking, collectReminders } from "../backend/salon-workflow.js";

const now = "2026-07-19T09:00:00.000Z";

test("салон: предлагает окна, если клиент не назвал время и имя", () => {
  const result = runSalonBooking({ message: "привет, хочу маникюр завтра вечером", now });
  assert.equal(result.status, "awaiting_choice");
  assert.equal(result.service, "маникюр");
  assert.ok(result.slots.length > 0);
});

test("салон: создаёт подтверждённый визит и не предлагает занятый слот", () => {
  const first = runSalonBooking({ message: "хочу маникюр завтра в 19:00, Ольга", now, clientId: "olga" });
  assert.equal(first.status, "confirmed");
  const next = runSalonBooking({ message: "маникюр завтра в 19:00, Марина", now, bookings: [first.appointment] });
  assert.equal(next.status, "confirmed");
  assert.notEqual(next.appointment.masterId, first.appointment.masterId);
});

test("салон: ставит напоминание только для ближайших 48 часов", () => {
  const booking = runSalonBooking({ message: "маникюр завтра в 19:00, Ольга", now, clientId: "olga" }).appointment;
  const reminders = collectReminders({ bookings: [booking], now });
  assert.equal(reminders.length, 1);
  assert.match(reminders[0].text, /подтвердите/i);
});
