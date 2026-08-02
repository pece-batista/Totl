import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/colors";
import { addMonths, monthDiff, monthLabel, todayMonthKey, isValidMonthKey } from "../utils/date";
import { parseDecimal, formatCurrency } from "../utils/currency";
import {
  fetchSalaryFromDb,
  updateSalaryInDb,
  fetchExpensesFromDb,
  saveExpenseToDb,
  deleteExpenseFromDb,
} from "../services/db";
import Header from "../components/Header";
import MonthRibbon from "../components/MonthRibbon";
import SummaryGrid from "../components/SummaryGrid";
import ExpenseRow from "../components/ExpenseRow";
import ExpenseForm from "../components/ExpenseForm";
import SectionLabel from "../components/SectionLabel";
import type { Expense, ActiveExpense, MonthSummary, FormNotice, ExpenseFormState, ExpenseStatus } from "../types";

const TIMELINE_LENGTH = 12;

function makeEmptyForm(startMonth: string): ExpenseFormState {
  return { name: "", value: "", installments: "1", startMonth };
}

type Props = {
  onSignOut?: () => void;
};

export default function BudgetScreen({ onSignOut }: Props) {
  const [loading, setLoading] = useState(true);
  const [salary, setSalary] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [error, setError] = useState("");
  const [formNotice, setFormNotice] = useState<FormNotice>(null);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<ExpenseFormState>(makeEmptyForm(todayMonthKey()));
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [s, ex] = await Promise.all([fetchSalaryFromDb(), fetchExpensesFromDb()]);
    setSalary(s);
    setExpenses(ex);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function persistSalary(value: number) {
    setSalary(value);
    const ok = await updateSalaryInDb(value);
    if (!ok) setError("Não consegui salvar o salário no banco. Tenta de novo.");
  }

  async function saveExpense(exp: Expense, isNew: boolean) {
    if (isNew) {
      setExpenses((prev) => [...prev, exp]);
    } else {
      setExpenses((prev) => prev.map((item) => (item.id === exp.id ? exp : item)));
    }
    const ok = await saveExpenseToDb(exp);
    if (!ok) {
      setError("Erro ao salvar lançamento no Supabase.");
    }
  }

  const selectedMonth = addMonths(todayMonthKey(), monthOffset);

  const activeExpensesForMonth = useCallback(
    (monthKey: string): ActiveExpense[] => {
      const result: ActiveExpense[] = [];
      for (const e of expenses) {
        const idx = monthDiff(e.startMonth, monthKey);
        if (idx >= 0 && idx < e.installments) {
          result.push({ ...e, currentInstallment: idx + 1 });
        }
      }
      return result;
    },
    [expenses]
  );

  const monthActive = useMemo(
    () => activeExpensesForMonth(selectedMonth),
    [activeExpensesForMonth, selectedMonth]
  );

  const committed = monthActive.reduce((sum, e) => sum + e.value, 0);
  const free = salary - committed;

  const timeline: MonthSummary[] = useMemo(() => {
    return Array.from({ length: TIMELINE_LENGTH }, (_, i) => {
      const mk = addMonths(todayMonthKey(), i);
      const active = activeExpensesForMonth(mk);
      const c = active.reduce((sum, e) => sum + e.value, 0);
      return { monthKey: mk, committed: c, free: salary - c };
    });
  }, [activeExpensesForMonth, salary]);

  const barBase = Math.max(salary, ...timeline.map((t) => t.committed), 100);

  function resetForm() {
    setForm(makeEmptyForm(selectedMonth));
    setEditingId(null);
  }

  function handleSubmit() {
    setFormNotice(null);
    if (!form.name.trim()) {
      setFormNotice({ type: "error", text: "Dá um nome pro gasto (ex: Mercado, Notebook...)." });
      return;
    }
    const totalValue = parseDecimal(form.value);
    if (isNaN(totalValue) || totalValue <= 0) {
      setFormNotice({ type: "error", text: "O valor precisa ser um número maior que zero (ex: 1200,00)." });
      return;
    }
    if (!form.startMonth || !isValidMonthKey(form.startMonth)) {
      setFormNotice({ type: "error", text: "Escolhe o mês inicial no campo de data." });
      return;
    }
    const installments = Math.max(1, parseInt(form.installments, 10) || 1);
    const monthlyValue = totalValue / installments;

    if (editingId) {
      const updatedExpense: Expense = {
        id: editingId,
        name: form.name.trim(),
        value: monthlyValue,
        installments,
        startMonth: form.startMonth,
      };
      saveExpense(updatedExpense, false);
      setFormNotice({ type: "success", text: "Lançamento atualizado." });
    } else {
      const newExpense: Expense = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: form.name.trim(),
        value: monthlyValue,
        installments,
        startMonth: form.startMonth,
      };
      saveExpense(newExpense, true);
      setFormNotice({ type: "success", text: `"${newExpense.name}" adicionado.` });
    }
    resetForm();
    setTimeout(() => setFormNotice(null), 3000);
  }

  function handleEdit(exp: Expense) {
    const totalValue = exp.value * exp.installments;
    // Arredonda para 2 casas decimais para evitar imprecisão de ponto flutuante
    const formattedTotal = Number(totalValue.toFixed(2));
    setForm({
      name: exp.name,
      value: String(formattedTotal).replace(".", ","),
      installments: String(exp.installments),
      startMonth: exp.startMonth,
    });
    setEditingId(exp.id);
    setError("");
    setFormNotice(null);
  }

  async function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteExpenseFromDb(id);
    if (editingId === id) resetForm();
  }

  function expenseStatus(exp: Expense): ExpenseStatus {
    const diff = monthDiff(exp.startMonth, todayMonthKey());
    if (diff >= exp.installments) return { label: "Quitado", tone: "dim" };
    if (diff < 0) return { label: `Começa em ${monthLabel(exp.startMonth)}`, tone: "brass" };
    return { label: `Parcela ${diff + 1}/${exp.installments}`, tone: "rust" };
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={colors.brass} />
        <Text style={styles.loadingText}>Carregando seu orçamento...</Text>
      </SafeAreaView>
    );
  }

  const sortedExpenses = expenses.slice().sort((a, b) => (a.startMonth < b.startMonth ? -1 : 1));

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <Header salary={salary} onSave={persistSalary} onSignOut={onSignOut} />

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <SectionLabel>Próximos 12 meses — livre vs. comprometido</SectionLabel>
          <MonthRibbon
            timeline={timeline}
            barBase={barBase}
            selectedIndex={monthOffset}
            onSelect={setMonthOffset}
          />

          <View style={{ marginBottom: 10 }}>
            <SectionLabel>{monthLabel(selectedMonth, "long")}</SectionLabel>
          </View>
          <SummaryGrid salary={salary} committed={committed} free={free} />

          <SectionLabel>Gastos deste mês</SectionLabel>
          <View style={styles.list}>
            {monthActive.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Nada lançado pra este mês ainda.</Text>
              </View>
            ) : (
              monthActive.map((e) => (
                <ExpenseRow
                  key={e.id}
                  name={e.name}
                  meta={e.installments > 1 ? `Parcela ${e.currentInstallment}/${e.installments}` : "Gasto único"}
                  value={e.value}
                  onEdit={() => handleEdit(e)}
                  onDelete={() => handleDelete(e.id)}
                />
              ))
            )}
          </View>

          <SectionLabel>{editingId ? "Editar lançamento" : "Adicionar gasto ou parcelamento"}</SectionLabel>
          <ExpenseForm
            form={form}
            onChange={setForm}
            editingId={editingId}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            notice={formNotice}
          />

          <TouchableOpacity onPress={() => setShowAll(!showAll)} style={styles.toggleAll}>
            <Text style={styles.toggleAllText}>
              {showAll ? "Ocultar" : "Ver"} todos os lançamentos cadastrados ({expenses.length})
            </Text>
          </TouchableOpacity>

          {showAll && (
            <View style={styles.list}>
              {sortedExpenses.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Nenhum lançamento cadastrado ainda.</Text>
                </View>
              ) : (
                sortedExpenses.map((exp) => {
                  const status = expenseStatus(exp);
                  return (
                    <ExpenseRow
                      key={exp.id}
                      name={exp.name}
                      meta={
                        exp.installments > 1
                          ? `${formatCurrency(exp.value)}/mês (${exp.installments}x = Total ${formatCurrency(exp.value * exp.installments)}) desde ${monthLabel(exp.startMonth)}`
                          : `${formatCurrency(exp.value)} à vista desde ${monthLabel(exp.startMonth)}`
                      }
                      value={exp.value}
                      badge={status}
                      onEdit={() => handleEdit(exp)}
                      onDelete={() => handleDelete(exp.id)}
                    />
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 160,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  errorBanner: {
    backgroundColor: colors.rustSoft,
    borderWidth: 1,
    borderColor: colors.rust,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.rust,
    fontSize: 13,
  },
  list: {
    gap: 8,
    marginBottom: 24,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
  },
  emptyText: {
    color: colors.paperDim,
    fontSize: 13,
  },
  toggleAll: {
    marginBottom: 10,
  },
  toggleAllText: {
    color: colors.brass,
    fontSize: 12,
  },
});
