import React, { useEffect, useState, useCallback } from "react";
import { StatusBar, View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./src/services/supabase";
import { signOutUser } from "./src/services/auth";
import {
  fetchSalaryFromDb,
  updateSalaryInDb,
  fetchExpensesFromDb,
  fetchCategoriesFromDb,
  saveCategoryToDb,
  deleteCategoryFromDb,
  deleteAllExpensesFromDb,
  deleteUserAccountFromDb,
  fetchIncomesFromDb,
  saveIncomeToDb,
  deleteIncomeFromDb,
} from "./src/services/db";
import BudgetScreen from "./src/screens/BudgetScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import AuthScreen from "./src/screens/AuthScreen";
import CategoriesModal from "./src/components/CategoriesModal";
import BottomNav, { type TabType } from "./src/components/BottomNav";
import { colors } from "./src/theme/colors";
import type { Expense, Category, CurrencyCode, Income } from "./src/types";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("budget");

  // Estado Compartilhado de Dados
  const [salary, setSalary] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("BRL");
  const [hideValues, setHideValues] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    if (!session) return;
    const [s, ex, cats, incs] = await Promise.all([
      fetchSalaryFromDb(),
      fetchExpensesFromDb(),
      fetchCategoriesFromDb(),
      fetchIncomesFromDb(),
    ]);
    setSalary(s);
    setExpenses(ex);
    setCategories(cats);
    setIncomes(incs);
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, loadData]);

  async function handleSaveSalary(val: number) {
    setSalary(val);
    await updateSalaryInDb(val);
  }

  async function handleClearExpenses() {
    setExpenses([]);
    await deleteAllExpensesFromDb();
  }

  async function handleDeleteAccount() {
    await deleteUserAccountFromDb();
  }

  async function handleAddIncome(name: string, value: number, monthKey: string) {
    const newIncome: Income = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      value,
      monthKey,
    };
    setIncomes((prev) => [newIncome, ...prev]);
    await saveIncomeToDb(newIncome);
  }

  async function handleDeleteIncome(id: string) {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
    await deleteIncomeFromDb(id);
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

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brass} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.ink} />
      {session ? (
        <View style={styles.appContainer}>
          <View style={styles.screenContainer}>
            {activeTab === "budget" && (
              <BudgetScreen
                salary={salary}
                setSalary={setSalary}
                expenses={expenses}
                setExpenses={setExpenses}
                categories={categories}
                setCategories={setCategories}
                incomes={incomes}
                onAddIncome={handleAddIncome}
                onDeleteIncome={handleDeleteIncome}
                currency={currency}
                hideValues={hideValues}
                onToggleHideValues={() => setHideValues((v) => !v)}
                onSignOut={signOutUser}
                onRefresh={loadData}
              />
            )}
            {activeTab === "dashboard" && (
              <DashboardScreen
                salary={salary}
                expenses={expenses}
                categories={categories}
                currency={currency}
                hideValues={hideValues}
                onSignOut={signOutUser}
              />
            )}
            {activeTab === "settings" && (
              <SettingsScreen
                salary={salary}
                currency={currency}
                onSelectCurrency={setCurrency}
                onSaveSalary={handleSaveSalary}
                onOpenCategoryManager={() => setCategoryModalVisible(true)}
                onSignOut={signOutUser}
                onClearExpenses={handleClearExpenses}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
          </View>

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

          <CategoriesModal
            visible={categoryModalVisible}
            categories={categories}
            onClose={() => setCategoryModalVisible(false)}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </View>
      ) : (
        <AuthScreen />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  appContainer: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  screenContainer: {
    flex: 1,
  },
});
