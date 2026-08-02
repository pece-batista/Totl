import { supabase } from "./supabase";
import type { Expense } from "../types";

/**
 * Função helper de resiliência: se o banco retornar erro de JWT emitido no futuro (PGRST303)
 * ou dessincronização temporária de relógio, aguarda 1 segundo e tenta novamente.
 */
async function handleQueryWithRetry<T>(
  queryFn: () => Promise<any>,
  maxRetries = 3
): Promise<{ data: T | null; error: any }> {
  let result = await queryFn();
  let retries = 0;

  while (result.error && retries < maxRetries) {
    const isClockSkew =
      result.error.code === "PGRST303" ||
      (result.error.message && result.error.message.includes("JWT issued at future"));

    if (isClockSkew) {
      console.warn(
        `[Supabase DB] Relógio em transição (${result.error.code}). Revalidando em 1s (tentativa ${retries + 1}/${maxRetries})...`
      );
      await new Promise((resolve) => setTimeout(() => resolve(null), 1000));
      result = await queryFn();
      retries++;
    } else {
      break;
    }
  }

  return result;
}

export async function fetchSalaryFromDb(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await handleQueryWithRetry<any>(async () =>
    await supabase
      .from("profiles")
      .select("salary")
      .eq("id", user.id)
      .maybeSingle()
  );

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

  const { error } = await handleQueryWithRetry(async () =>
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        salary: value,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
        full_name: user.user_metadata?.full_name || "Usuário",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
  );

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

  const { data, error } = await handleQueryWithRetry<any[]>(async () =>
    await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
  );

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

  const { error } = await handleQueryWithRetry(async () =>
    await supabase.from("expenses").upsert({
      id: expense.id,
      user_id: user.id,
      name: expense.name,
      value: expense.value,
      installments: expense.installments,
      start_month: expense.startMonth,
    })
  );

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

  const { error } = await handleQueryWithRetry(async () =>
    await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
  );

  if (error) {
    console.error("Erro ao excluir gasto do Supabase:", error);
    return false;
  }
  return true;
}
