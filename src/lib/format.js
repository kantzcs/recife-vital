// Datas no formato que a gente fala: "Amanhã, 9h30", "Qui, 5 nov · 9h30".
// As datas dos atendimentos chegam como "dd/mm/aaaa" e o horário como "hh:mm".

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function parseBrDate(date) {
  if (!date) return null;
  const [day, month, year] = date.split("/").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

export function formatTime(time) {
  if (!time) return "";
  const [hh, mm] = time.split(":");
  const hour = Number(hh);
  return mm === "00" ? `${hour}h` : `${hour}h${mm}`;
}

export function formatDayLabel(date) {
  const target = parseBrDate(date);
  if (!target) return date ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / 86400000);

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  if (diffDays === -1) return "Ontem";

  const label = `${WEEKDAYS[target.getDay()]}, ${target.getDate()} ${MONTHS[target.getMonth()]}`;
  return target.getFullYear() === today.getFullYear()
    ? label
    : `${label} ${target.getFullYear()}`;
}

// inline: true deixa a primeira letra minúscula, para usar no meio de uma frase.
export function formatAppointment(date, time, { inline = false } = {}) {
  let day = formatDayLabel(date);
  if (inline) day = day.charAt(0).toLowerCase() + day.slice(1);
  const hour = formatTime(time);
  return hour ? `${day}, ${hour}` : day;
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
