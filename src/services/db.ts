import { supabase } from "./supabase";
import type { Expense, Category } from "../types";

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
    categoryId: row.category_id || null,
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
      category_id: expense.categoryId || null,
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

/* ============================================================================
   CATEGORIAS CUSTOMIZADAS
   ============================================================================ */

const DEFAULT_CATEGORIES: Array<Omit<Category, "id">> = [
  { name: "Moradia", color: "#C0603B" },
  { name: "Mercado", color: "#4FA184" },
  { name: "Contas", color: "#D7B56D" },
  { name: "Lazer", color: "#8B7EC8" },
];

export async function fetchCategoriesFromDb(): Promise<Category[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await handleQueryWithRetry<any[]>(async () =>
    await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
  );

  if (error) {
    console.error("Erro ao carregar categorias do Supabase:", error);
    return [];
  }

  // Se o usuário ainda não tiver categorias, cria as padrão automaticamente
  if (!data || data.length === 0) {
    const created: Category[] = [];
    for (const def of DEFAULT_CATEGORIES) {
      const { data: newCat, error: insertErr } = await handleQueryWithRetry<any>(async () =>
        await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: def.name,
            color: def.color,
          })
          .select()
          .single()
      );
      if (newCat && !insertErr) {
        created.push({ id: newCat.id, name: newCat.name, color: newCat.color });
      }
    }
    return created;
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    color: row.color,
  }));
}

export async function saveCategoryToDb(category: Category): Promise<Category | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await handleQueryWithRetry<any>(async () =>
    await supabase
      .from("categories")
      .upsert({
        id: category.id || undefined,
        user_id: user.id,
        name: category.name,
        color: category.color,
      })
      .select()
      .single()
  );

  if (error) {
    console.error("Erro ao salvar categoria no Supabase:", error);
    return null;
  }

  return { id: data.id, name: data.name, color: data.color };
}

export async function deleteCategoryFromDb(id: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await handleQueryWithRetry(async () =>
    await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
  );

  if (error) {
    console.error("Erro ao excluir categoria do Supabase:", error);
    return false;
  }
  return true;
}
