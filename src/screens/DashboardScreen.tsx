import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, TrendingUp, Calendar, Tag, ShieldCheck } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { addMonths, monthDiff, monthLabel, todayMonthKey } from "../utils/date";
import { formatCurrency } from "../utils/currency";
import MonthRibbon from "../components/MonthRibbon";
import SummaryGrid from "../components/SummaryGrid";
import SectionLabel from "../components/SectionLabel";
import type { Expense, MonthSummary, Category } from "../types";

const TIMELINE_LENGTH = 12;

type Props = {
  salary: number;
  expenses: Expense[];
  categories: Category[];
  onSignOut?: () => void;
};

export default function DashboardScreen({
  salary,
  expenses,
  categories,
  onSignOut,
}: Props) {
  const [monthOffset, setMonthOffset] = useState(0);

  const selectedMonth = addMonths(todayMonthKey(), monthOffset);

  // Mapeia categorias por ID
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Calcula linha do tempo dos próximos 12 meses
  const timeline: MonthSummary[] = useMemo(() => {
    return Array.from({ length: TIMELINE_LENGTH }, (_, i) => {
      const mk = addMonths(todayMonthKey(), i);
      let committed = 0;
      for (const e of expenses) {
        const diff = monthDiff(e.startMonth, mk);
        if (diff >= 0 && diff < e.installments) {
          committed += e.value;
        }
      }
      return { monthKey: mk, committed, free: salary - committed };
    });
  }, [expenses, salary]);

  const barBase = Math.max(salary, ...timeline.map((t) => t.committed), 100);

  // Mês selecionado no gráfico
  const currentSummary = timeline[monthOffset] || {
    committed: 0,
    free: salary,
  };

  // Métricas Analíticas
  const totalYearCommitted = useMemo(
    () => timeline.reduce((acc, curr) => acc + curr.committed, 0),
    [timeline]
  );

  const averageMonthlyCommitted = totalYearCommitted / TIMELINE_LENGTH;

  // Mês de maior comprometimento
  const highestCommittedMonth = useMemo(() => {
    return timeline.reduce(
      (max, curr) => (curr.committed > max.committed ? curr : max),
      timeline[0] || { monthKey: todayMonthKey(), committed: 0 }
    );
  }, [timeline]);

  // Resumo por Categoria no mês selecionado
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    let uncategorizedSum = 0;

    for (const e of expenses) {
      const diff = monthDiff(e.startMonth, selectedMonth);
      if (diff >= 0 && diff < e.installments) {
        if (e.categoryId && categoryMap.has(e.categoryId)) {
          const current = map.get(e.categoryId) || 0;
          map.set(e.categoryId, current + e.value);
        } else {
          uncategorizedSum += e.value;
        }
      }
    }

    const items: Array<{ category: Category | null; total: number }> = [];
    map.forEach((total, catId) => {
      const cat = categoryMap.get(catId);
      if (cat) items.push({ category: cat, total });
    });

    if (uncategorizedSum > 0) {
      items.push({ category: null, total: uncategorizedSum });
    }

    return items.sort((a, b) => b.total - a.total);
  }, [expenses, selectedMonth, categoryMap]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={styles.title}>Dashboard</Text>
              {onSignOut && (
                <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} hitSlop={8}>
                  <LogOut size={16} color={colors.rust} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.subtitle}>Visão geral e projeção financeira de 12 meses</Text>
          </View>
        </View>

        {/* Linha do Tempo 12 Meses */}
        <SectionLabel>Projeção de 12 Meses — Livre vs. Comprometido</SectionLabel>
        <MonthRibbon
          timeline={timeline}
          barBase={barBase}
          selectedIndex={monthOffset}
          onSelect={setMonthOffset}
        />

        {/* Resumo do Mês Selecionado */}
        <View style={{ marginBottom: 10 }}>
          <SectionLabel>{monthLabel(selectedMonth, "long")}</SectionLabel>
        </View>
        <SummaryGrid
          salary={salary}
          committed={currentSummary.committed}
          free={currentSummary.free}
        />

        {/* Cards de Métricas Analíticas */}
        <SectionLabel>Estatísticas do Análise</SectionLabel>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <TrendingUp size={16} color={colors.brass} />
              <Text style={styles.metricLabel}>Média Mensal Comprometida</Text>
            </View>
            <Text style={styles.metricValue}>{formatCurrency(averageMonthlyCommitted)}</Text>
            <Text style={styles.metricSub}>Média estimada nos próximos 12 meses</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Calendar size={16} color={colors.rust} />
              <Text style={styles.metricLabel}>Mês com Maior Gasto</Text>
            </View>
            <Text style={styles.metricValue}>
              {monthLabel(highestCommittedMonth.monthKey)}
            </Text>
            <Text style={styles.metricSub}>
              {formatCurrency(highestCommittedMonth.committed)} comprometidos
            </Text>
          </View>
        </View>

        {/* Resumo por Categoria */}
        <SectionLabel>Gastos por Categoria ({monthLabel(selectedMonth)})</SectionLabel>
        <View style={styles.categoryCard}>
          {categoryBreakdown.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum gasto neste mês para categorizar.</Text>
          ) : (
            categoryBreakdown.map((item, idx) => {
              const percentage =
                currentSummary.committed > 0
                  ? Math.round((item.total / currentSummary.committed) * 100)
                  : 0;

              const catColor = item.category ? item.category.color : colors.paperDim;
              const catName = item.category ? item.category.name : "Sem Categoria";

              return (
                <View key={item.category?.id || `uncat-${idx}`} style={styles.catRow}>
                  <View style={styles.catRowHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={styles.catName}>{catName}</Text>
                    </View>
                    <Text style={styles.catTotal}>
                      {formatCurrency(item.total)}{" "}
                      <Text style={styles.catPercent}>({percentage}%)</Text>
                    </Text>
                  </View>
                  {/* Progress Bar */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: catColor, width: `${Math.min(100, percentage)}%` },
                      ]}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 18,
    marginBottom: 22,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.paper,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: colors.paperDim,
    fontSize: 12,
    marginTop: 4,
  },
  signOutBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.rustSoft,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
  },
  metricValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 20,
    color: colors.paper,
  },
  metricSub: {
    fontSize: 11,
    color: colors.paperDim,
  },
  categoryCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  emptyText: {
    color: colors.paperDim,
    fontSize: 13,
    fontStyle: "italic",
  },
  catRow: {
    gap: 6,
  },
  catRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.paper,
  },
  catTotal: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.paper,
  },
  catPercent: {
    fontSize: 11,
    color: colors.paperDim,
    fontWeight: "normal",
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.panel2,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
});
