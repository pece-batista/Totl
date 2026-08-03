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
import { parseDecimal, formatCurrency, formatCurrencyInput } from "../utils/currency";
import {
  fetchSalaryFromDb,
  updateSalaryInDb,
  fetchExpensesFromDb,
  saveExpenseToDb,
  deleteExpenseFromDb,
  fetchCategoriesFromDb,
  saveCategoryToDb,
  deleteCategoryFromDb,
} from "../services/db";
import Header from "../components/Header";
import DonutChart from "../components/DonutChart";
import MonthStepper from "../components/MonthStepper";
import SummaryGrid from "../components/SummaryGrid";
import IncomesSection from "../components/IncomesSection";
import ExpenseRow from "../components/ExpenseRow";
import ExpenseForm from "../components/ExpenseForm";
import CategoriesModal from "../components/CategoriesModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import SectionLabel from "../components/SectionLabel";
import type { Expense, ActiveExpense, MonthSummary, FormNotice, ExpenseFormState, ExpenseStatus, Category, CurrencyCode, Income } from "../types";

const TIMELINE_LENGTH = 12;

function makeEmptyForm(startMonth: string): ExpenseFormState {
  return { name: "", value: "", valueMode: "total", installments: "1", startMonth, categoryId: null };
}

type Props = {
  salary?: number;
  setSalary?: React.Dispatch<React.SetStateAction<number>>;
  expenses?: Expense[];
  setExpenses?: React.Dispatch<React.SetStateAction<Expense[]>>;
  categories?: Category[];
  setCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  incomes?: Income[];
  onAddIncome?: (name: string, value: number, monthKey: string) => void;
  onDeleteIncome?: (id: string) => void;
  currency?: CurrencyCode;
  hideValues?: boolean;
  onToggleHideValues?: () => void;
  onSignOut?: () => void;
  onRefresh?: () => Promise<void>;
};

export default function BudgetScreen({
  salary: propSalary,
  setSalary: propSetSalary,
  expenses: propExpenses,
  setExpenses: propSetExpenses,
  categories: propCategories,
  setCategories: propSetCategories,
  incomes = [],
  onAddIncome,
  onDeleteIncome,
  currency = "BRL",
  hideValues = false,
  onToggleHideValues,
  onSignOut,
  onRefresh,
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalSalary, setInternalSalary] = useState(0);
  const [internalExpenses, setInternalExpenses] = useState<Expense[]>([]);
  const [internalCategories, setInternalCategories] = useState<Category[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const [error, setError] = useState("");
  const [formNotice, setFormNotice] = useState<FormNotice>(null);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState<ExpenseFormState>(makeEmptyForm(todayMonthKey()));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isControlled = propSalary !== undefined;

  const salary = isControlled ? propSalary : internalSalary;
  const setSalary = isControlled
    ? (val: number | ((prev: number) => number)) => {
        if (typeof val === "function") propSetSalary?.(val);
        else propSetSalary?.(val);
      }
    : setInternalSalary;

  const expenses = isControlled ? propExpenses || [] : internalExpenses;
  const setExpenses = isControlled ? propSetExpenses! : setInternalExpenses;

  const categories = isControlled ? propCategories || [] : internalCategories;
  const setCategories = isControlled ? propSetCategories! : setInternalCategories;

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const loadData = useCallback(async () => {
    if (isControlled) return;
    setInternalLoading(true);
    setError("");
    const [s, ex, cats] = await Promise.all([
      fetchSalaryFromDb(),
      fetchExpensesFromDb(),
      fetchCategoriesFromDb(),
    ]);
    setInternalSalary(s);
    setInternalExpenses(ex);
    setInternalCategories(cats);
    setInternalLoading(false);
  }, [isControlled]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedMonth = useMemo(
    () => addMonths(todayMonthKey(), monthOffset),
    [monthOffset]
  );

  const activeExpensesForMonth = useCallback(
    (mk: string): ActiveExpense[] => {
      const result: ActiveExpense[] = [];
      for (const e of expenses) {
        const diff = monthDiff(e.startMonth, mk);
        if (diff >= 0 && diff < e.installments) {
          result.push({ ...e, currentInstallment: diff + 1 });
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

  const committed = useMemo(
    () => monthActive.reduce((sum, e) => sum + e.value, 0),
    [monthActive]
  );

  const monthExtraIncome = useMemo(
    () => incomes.filter((i) => i.monthKey === selectedMonth).reduce((acc, i) => acc + i.value, 0),
    [incomes, selectedMonth]
  );

  const free = salary + monthExtraIncome - committed;

  const timeline: MonthSummary[] = useMemo(() => {
    return Array.from({ length: TIMELINE_LENGTH }, (_, i) => {
      const mk = addMonths(todayMonthKey(), i);
      const active = activeExpensesForMonth(mk);
      const c = active.reduce((sum, e) => sum + e.value, 0);
      const extra = incomes.filter((inc) => inc.monthKey === mk).reduce((acc, inc) => acc + inc.value, 0);
      return { monthKey: mk, committed: c, free: salary + extra - c, extraIncome: extra };
    });
  }, [activeExpensesForMonth, salary, incomes]);

  function resetForm() {
    setForm(makeEmptyForm(selectedMonth));
    setEditingId(null);
  }

  function handleSubmit(calculatedMonthlyValue?: number) {
    setFormNotice(null);
    if (!form.name.trim()) {
      setFormNotice({ type: "error", text: "Dá um nome pro gasto (ex: Mercado, Notebook...)." });
      return;
    }
    const rawValue = parseDecimal(form.value);
    if (isNaN(rawValue) || rawValue <= 0) {
      setFormNotice({ type: "error", text: "O valor precisa ser um número maior que zero (ex: 1200,00)." });
      return;
    }
    if (!form.startMonth || !isValidMonthKey(form.startMonth)) {
      setFormNotice({ type: "error", text: "Escolhe o mês inicial no campo de data." });
      return;
    }
    const installments = Math.max(1, parseInt(form.installments, 10) || 1);
    
    let monthlyValue = 0;
    if (typeof calculatedMonthlyValue === "number" && calculatedMonthlyValue > 0) {
      monthlyValue = calculatedMonthlyValue;
    } else {
      monthlyValue = form.valueMode === "installment" ? rawValue : rawValue / installments;
    }

    if (editingId) {
      const updatedExpense: Expense = {
        id: editingId,
        name: form.name.trim(),
        value: monthlyValue,
        installments,
        startMonth: form.startMonth,
        categoryId: form.categoryId || null,
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
        categoryId: form.categoryId || null,
      };
      saveExpense(newExpense, true);
      setFormNotice({ type: "success", text: `"${newExpense.name}" adicionado.` });
    }
    resetForm();
    setTimeout(() => setFormNotice(null), 3000);
  }

  function handleEdit(exp: Expense) {
    const totalValue = exp.value * exp.installments;
    const totalCents = Math.round(totalValue * 100);
    setForm({
      name: exp.name,
      value: formatCurrencyInput(String(totalCents)),
      valueMode: "total",
      installments: String(exp.installments),
      startMonth: exp.startMonth,
      categoryId: exp.categoryId || null,
    });
    setEditingId(exp.id);
    setError("");
    setFormNotice(null);
  }

  async function confirmDeleteExpense() {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    const id = expenseToDelete.id;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteExpenseFromDb(id);
    if (editingId === id) resetForm();
    setDeleteLoading(false);
    setExpenseToDelete(null);
  }

  async function persistSalary(val: number) {
    setSalary(val);
    await updateSalaryInDb(val);
  }

  async function saveExpense(exp: Expense, isNew: boolean) {
    if (isNew) {
      setExpenses((prev) => [exp, ...prev]);
    } else {
      setExpenses((prev) => prev.map((e) => (e.id === exp.id ? exp : e)));
    }
    await saveExpenseToDb(exp);
  }

  async function handleSaveCategory(category: Category) {
    const saved = await saveCategoryToDb(category);
    if (saved) {
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
    }
  }

  async function handleDeleteCategory(id: string) {
    const ok = await deleteCategoryFromDb(id);
    if (ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setExpenses((prev) =>
        prev.map((e) => (e.categoryId === id ? { ...e, categoryId: null } : e))
      );
    }
  }

  function getStatus(exp: Expense, currentMonthKey: string): ExpenseStatus {
    const startDiff = monthDiff(exp.startMonth, currentMonthKey);
    if (startDiff < 0) {
      return { label: `Começa em ${monthLabel(exp.startMonth)}`, tone: "dim" };
    }
    const inst = startDiff + 1;
    if (inst > exp.installments) {
      return { label: "Quitado", tone: "brass" };
    }
    return { label: `Parcela ${inst}/${exp.installments}`, tone: "rust" };
  }

  if (!isControlled && internalLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brass} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <Header
            salary={salary}
            currency={currency}
            hideValues={hideValues}
            onToggleHideValues={onToggleHideValues}
            onSave={persistSalary}
            onSignOut={onSignOut}
          />

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Seletor de Mês e Gráfico em Rosquinha (Donut) */}
          <View style={styles.monthHeaderRow}>
            <SectionLabel>{monthLabel(selectedMonth, "long")}</SectionLabel>
            <MonthStepper
              value={selectedMonth}
              onChange={(mKey) => {
                const diff = monthDiff(todayMonthKey(), mKey);
                setMonthOffset(diff);
              }}
            />
          </View>

          <DonutChart
            salary={salary + monthExtraIncome}
            committed={committed}
            free={free}
            expenses={monthActive}
            categoryMap={categoryMap}
            currency={currency}
            hideValues={hideValues}
          />

          <SummaryGrid
            salary={salary}
            extraIncome={monthExtraIncome}
            committed={committed}
            free={free}
            currency={currency}
            hideValues={hideValues}
          />

          {/* Seção de Rendas Extras do Mês */}
          <IncomesSection
            selectedMonth={selectedMonth}
            monthLabel={monthLabel(selectedMonth)}
            incomes={incomes}
            currency={currency}
            hideValues={hideValues}
            onAddIncome={(name, value) => onAddIncome?.(name, value, selectedMonth)}
            onDeleteIncome={(id) => onDeleteIncome?.(id)}
          />

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
                  category={e.categoryId ? categoryMap.get(e.categoryId) : null}
                  currency={currency}
                  hideValues={hideValues}
                  onEdit={() => handleEdit(e)}
                  onDelete={() => setExpenseToDelete(e)}
                />
              ))
            )}
          </View>

          <SectionLabel>{editingId ? "Editar lançamento" : "Adicionar gasto ou parcelamento"}</SectionLabel>
          <ExpenseForm
            form={form}
            categories={categories}
            currency={currency}
            hideValues={hideValues}
            onChange={setForm}
            editingId={editingId}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            onOpenCategoryManager={() => setCategoryModalVisible(true)}
            notice={formNotice}
          />

          {/* Lista Completa */}
          <View style={styles.allExpensesHeader}>
            <SectionLabel>Todos os lançamentos ({expenses.length})</SectionLabel>
            <TouchableOpacity onPress={() => setShowAll((v) => !v)}>
              <Text style={styles.toggleText}>{showAll ? "Ocultar" : "Mostrar todos"}</Text>
            </TouchableOpacity>
          </View>

          {showAll && (
            <View style={styles.list}>
              {expenses.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Nenhum gasto cadastrado no sistema.</Text>
                </View>
              ) : (
                expenses.map((e) => (
                  <ExpenseRow
                    key={e.id}
                    name={e.name}
                    meta={`Total: ${formatCurrency(e.value * e.installments, currency, hideValues)} • ${monthLabel(e.startMonth)}`}
                    value={e.value}
                    category={e.categoryId ? categoryMap.get(e.categoryId) : null}
                    badge={getStatus(e, selectedMonth)}
                    currency={currency}
                    hideValues={hideValues}
                    onEdit={() => handleEdit(e)}
                    onDelete={() => setExpenseToDelete(e)}
                  />
                ))
              )}
            </View>
          )}

          <CategoriesModal
            visible={categoryModalVisible}
            categories={categories}
            onClose={() => setCategoryModalVisible(false)}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />

          <ConfirmDeleteModal
            visible={!!expenseToDelete}
            itemName={expenseToDelete?.name}
            itemValue={expenseToDelete?.value}
            currency={currency}
            hideValues={hideValues}
            loading={deleteLoading}
            onConfirm={confirmDeleteExpense}
            onCancel={() => setExpenseToDelete(null)}
          />
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
  loading: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorBanner: {
    backgroundColor: colors.rustSoft,
    borderWidth: 1,
    borderColor: colors.rust,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: colors.rust,
    fontSize: 13,
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  list: {
    gap: 8,
    marginBottom: 24,
  },
  empty: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: colors.paperDim,
    fontSize: 13,
  },
  allExpensesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  toggleText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.brass,
  },
});
