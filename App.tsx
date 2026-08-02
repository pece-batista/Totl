import React, { useEffect, useState, useCallback } from "react";
import { StatusBar, View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./src/services/supabase";
import { signOutUser } from "./src/services/auth";
import {
  fetchSalaryFromDb,
  fetchExpensesFromDb,
  fetchCategoriesFromDb,
} from "./src/services/db";
import BudgetScreen from "./src/screens/BudgetScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import AuthScreen from "./src/screens/AuthScreen";
import BottomNav, { type TabType } from "./src/components/BottomNav";
import { colors } from "./src/theme/colors";
import type { Expense, Category } from "./src/types";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("budget");

  // Estado Compartilhado de Dados
  const [salary, setSalary] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadData = useCallback(async () => {
    if (!session) return;
    const [s, ex, cats] = await Promise.all([
      fetchSalaryFromDb(),
      fetchExpensesFromDb(),
      fetchCategoriesFromDb(),
    ]);
    setSalary(s);
    setExpenses(ex);
    setCategories(cats);
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
            {activeTab === "budget" ? (
              <BudgetScreen
                salary={salary}
                setSalary={setSalary}
                expenses={expenses}
                setExpenses={setExpenses}
                categories={categories}
                setCategories={setCategories}
                onSignOut={signOutUser}
                onRefresh={loadData}
              />
            ) : (
              <DashboardScreen
                salary={salary}
                expenses={expenses}
                categories={categories}
                onSignOut={signOutUser}
              />
            )}
          </View>
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
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
