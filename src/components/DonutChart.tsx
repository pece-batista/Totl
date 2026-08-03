import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { colors, fonts } from "../theme/colors";
import { formatCurrency } from "../utils/currency";
import type { ActiveExpense, Category, CurrencyCode } from "../types";

type Props = {
  salary: number;
  committed: number;
  free: number;
  expenses: ActiveExpense[];
  categoryMap: Map<string, Category>;
  currency?: CurrencyCode;
};

export default function DonutChart({
  salary,
  committed,
  free,
  expenses,
  categoryMap,
  currency = "BRL",
}: Props) {
  const size = 230;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Agrupa os gastos do mês por categoria
  const slices = useMemo(() => {
    const map = new Map<string, { category: Category | null; total: number }>();
    let uncategorizedSum = 0;

    for (const e of expenses) {
      if (e.categoryId && categoryMap.has(e.categoryId)) {
        const current = map.get(e.categoryId) || {
          category: categoryMap.get(e.categoryId)!,
          total: 0,
        };
        current.total += e.value;
        map.set(e.categoryId, current);
      } else {
        uncategorizedSum += e.value;
      }
    }

    const result: Array<{ category: Category | null; total: number; color: string; name: string }> = [];

    map.forEach((item) => {
      if (item.category) {
        result.push({
          category: item.category,
          total: item.total,
          color: item.category.color,
          name: item.category.name,
        });
      }
    });

    if (uncategorizedSum > 0) {
      result.push({
        category: null,
        total: uncategorizedSum,
        color: colors.paperDim,
        name: "Outros",
      });
    }

    return result.sort((a, b) => b.total - a.total);
  }, [expenses, categoryMap]);

  // A rosquinha representa 100% do total de gastos comprometidos do mês
  const totalBase = Math.max(1, committed);

  let accumulatedOffset = 0;
  const arcSlices = slices.map((slice) => {
    const percentage = slice.total / totalBase;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += percentage * circumference;

    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
      percentage: Math.round(percentage * 100),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Círculo de fundo neutro se não houver gastos */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.panel2}
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Arcos coloridos por categoria com cantos retos (strokeLinecap="butt") */}
            {arcSlices.map((arc, index) => (
              <Circle
                key={arc.category?.id || `arc-${index}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                strokeLinecap="butt"
                fill="transparent"
              />
            ))}
          </G>
        </Svg>

        {/* Miolo Central Solto com o Saldo Livre */}
        <View style={styles.centerContent}>
          <Text style={styles.centerLabel}>SALDO LIVRE</Text>
          <Text style={[styles.centerValue, { color: free >= 0 ? colors.jade : colors.rust }]}>
            {formatCurrency(free, currency)}
          </Text>
          <Text style={styles.centerSub}>
            {committed > 0 ? `${formatCurrency(committed, currency)} comprometidos` : "Nenhum gasto este mês"}
          </Text>
        </View>
      </View>

      {/* Legenda Solta de Categorias do Mês */}
      {slices.length > 0 && (
        <View style={styles.legendContainer}>
          {slices.map((slice, index) => {
            const percent = committed > 0 ? Math.round((slice.total / committed) * 100) : 0;
            return (
              <View key={slice.category?.id || `leg-${index}`} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                <Text style={styles.legendName}>{slice.name}</Text>
                <Text style={styles.legendValue}>
                  {formatCurrency(slice.total, currency)} <Text style={styles.legendPercent}>({percent}%)</Text>
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 20,
    gap: 16,
  },
  chartWrapper: {
    width: 230,
    height: 230,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centerLabel: {
    fontSize: 10,
    fontFamily: fonts.monoSemiBold,
    letterSpacing: 1.2,
    color: colors.paperDim,
    marginBottom: 2,
  },
  centerValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    textAlign: "center",
  },
  centerSub: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.paperDim,
    marginTop: 2,
    textAlign: "center",
  },
  legendContainer: {
    width: "100%",
    gap: 8,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.paper,
    flex: 1,
  },
  legendValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.paper,
  },
  legendPercent: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.paperDim,
    fontWeight: "normal",
  },
});
