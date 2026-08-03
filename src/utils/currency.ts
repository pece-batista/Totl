import type { CurrencyCode } from "../types";

export const CURRENCIES: Record<
  CurrencyCode,
  { label: string; symbol: string; thousandSep: string; decimalSep: string }
> = {
  BRL: { label: "Real Brasileiro (R$)", symbol: "R$ ", thousandSep: ".", decimalSep: "," },
  USD: { label: "Dólar Americano ($)", symbol: "$ ", thousandSep: ",", decimalSep: "." },
  EUR: { label: "Euro (€)", symbol: "€ ", thousandSep: ".", decimalSep: "," },
  GBP: { label: "Libra Esterlina (£)", symbol: "£ ", thousandSep: ",", decimalSep: "." },
};

export function formatCurrency(value: number, currency: CurrencyCode = "BRL"): string {
  const config = CURRENCIES[currency] || CURRENCIES.BRL;
  const negative = value < 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSep);
  return `${negative ? "-" : ""}${config.symbol}${withThousands}${config.decimalSep}${decPart}`;
}

export function parseDecimal(input: string): number {
  return parseFloat(String(input).trim().replace(/\./g, "").replace(",", "."));
}

export function formatCurrencyInput(rawInput: string): string {
  const cleanDigits = String(rawInput || "").replace(/\D/g, "");
  if (!cleanDigits || cleanDigits === "0") {
    return "";
  }
  const cents = parseInt(cleanDigits, 10);
  const value = cents / 100;
  const fixed = value.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}`;
}
