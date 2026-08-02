import { supabase } from "./supabase";
import type { Expense } from "../types";

export async function fetchSalaryFromDb(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from("profiles")
    .select("salary")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar salário do Supabase:", error);
    return 0;
  }
  return data?.salary ? Number(data.salary) : 0;
}

export async function updateSalaryInDb(value: number): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ salary: value })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao atualizar salário no Supabase:", error);
    return false;
  }
  return true;
}

export async function fetchExpensesFromDb(): Promise<Expense[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar gastos do Supabase:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    value: Number(row.value),
    installments: Number(row.installments),
    startMonth: row.start_month,
  }));
}

export async function saveExpenseToDb(expense: Expense): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("expenses").upsert({
    id: expense.id,
    user_id: user.id,
    name: expense.name,
    value: expense.value,
    installments: expense.installments,
    start_month: expense.startMonth,
  });

  if (error) {
    console.error("Erro ao salvar gasto no Supabase:", error);
    return false;
  }
  return true;
}

export async function deleteExpenseFromDb(id: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao excluir gasto do Supabase:", error);
    return false;
  }
  return true;
}
