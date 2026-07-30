const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const MONTHS_LONG = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function todayMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [y, m] = monthKey.split("-").map(Number);
  return { year: y, month: m };
}

export function addMonths(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthDiff(fromKey: string, toKey: string): number {
  const from = parseMonthKey(fromKey);
  const to = parseMonthKey(toKey);
  return (to.year - from.year) * 12 + (to.month - from.month);
}

export function monthLabel(monthKey: string, mode: "short" | "long" = "short"): string {
  const { year, month } = parseMonthKey(monthKey);
  if (mode === "long") {
    return `${MONTHS_LONG[month - 1]} de ${year}`;
  }
  return `${MONTHS_SHORT[month - 1]}/${String(year).slice(2)}`;
}

export function isValidMonthKey(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}
