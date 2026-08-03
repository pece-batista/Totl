export type CurrencyCode = "BRL" | "USD" | "EUR" | "GBP";

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Expense = {
  id: string;
  name: string;
  value: number;
  installments: number;
  startMonth: string; // "YYYY-MM"
  categoryId?: string | null;
};

export type ActiveExpense = Expense & { currentInstallment: number };

export type MonthSummary = {
  monthKey: string;
  committed: number;
  free: number;
};

export type ExpenseStatus = {
  label: string;
  tone: "dim" | "brass" | "rust";
};

export type FormNotice = { type: "error" | "success"; text: string } | null;

export type ExpenseFormState = {
  name: string;
  value: string;
  installments: string;
  startMonth: string;
  categoryId: string | null;
};
