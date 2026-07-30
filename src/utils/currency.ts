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
