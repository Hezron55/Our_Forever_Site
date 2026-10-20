"use strict";

const anniversaryDate = "2027-03-28";
const anniversaryTimezone = "Africa/Lusaka";
const pad = (value) => String(value).padStart(2, "0");

function partsInTimeZone(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: anniversaryTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function localZonedTimeToUtc(year, month, day) {
  const desiredAsUtc = Date.UTC(year, month - 1, day);
  let estimate = desiredAsUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shown = partsInTimeZone(new Date(estimate));
    const shownAsUtc = Date.UTC(
      Number(shown.year),
      Number(shown.month) - 1,
      Number(shown.day),
      Number(shown.hour),
      Number(shown.minute),
      Number(shown.second)
    );
    estimate += desiredAsUtc - shownAsUtc;
  }
  return estimate;
}

const [, year, month, day] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(anniversaryDate).map(Number);
const target = localZonedTimeToUtc(year, month, day);
document.getElementById("date-label").textContent = new Intl.DateTimeFormat("en", {
  timeZone: anniversaryTimezone,
  year: "numeric",
  month: "long",
  day: "numeric"
}).format(new Date(target)) + ` · ${anniversaryTimezone}`;

function updateCountdown() {
  const now = Date.now();
  const left = target - now;
  const localToday = partsInTimeZone(new Date(now));
  const isTargetDay = localToday.year === String(year)
    && localToday.month === pad(month)
    && localToday.day === pad(day);
  const values = left > 0 ? {
    days: Math.floor(left / 86_400_000),
    hours: Math.floor((left % 86_400_000) / 3_600_000),
    minutes: Math.floor((left % 3_600_000) / 60_000),
    seconds: Math.floor((left % 60_000) / 1_000)
  } : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  Object.entries(values).forEach(([unit, value]) => {
    document.getElementById(`count-${unit}`).textContent = unit === "days" ? String(value) : pad(value);
  });

  const message = document.getElementById("count-message");
  if (left > 0) message.textContent = "Every second brings another little moment closer.";
  else if (isTargetDay) message.textContent = "Today is our day. Happy anniversary, my love.";
  else message.textContent = "Our anniversary date has passed. This little celebration stays ours.";
}

updateCountdown();
window.setInterval(updateCountdown, 1000);
