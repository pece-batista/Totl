export function formatCurrency(value: number): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const fixed = abs.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}R$ ${withThousands},${decPart}`;
}

export function parseDecimal(input: string): number {
  return parseFloat(String(input).trim().replace(/\./g, "").replace(",", "."));
}

/**
 * Converte qualquer texto digitado em formato financeiro de banco (centavos automáticos).
 * Ex: "1" -> "0,01" | "120" -> "1,20" | "120000" -> "1.200,00"
 */
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
