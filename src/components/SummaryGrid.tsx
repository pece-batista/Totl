import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency } from "../utils/currency";
import type { CurrencyCode } from "../types";

type Props = {
  salary: number;
  extraIncome?: number;
  committed: number;
  free?: number;
  currency?: CurrencyCode;
  hideValues?: boolean;
};

export default function SummaryGrid({
  salary,
  extraIncome = 0,
  committed,
  currency = "BRL",
  hideValues = false,
}: Props) {
  const totalRevenue = salary + extraIncome;

  return (
    <View style={styles.grid}>
      <View style={styles.stat}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{extraIncome > 0 ? "Receita Total" : "Salário"}</Text>
          {extraIncome > 0 && (
            <Text style={styles.extraTag}>+{formatCurrency(extraIncome, currency, hideValues)}</Text>
          )}
        </View>
        <Text style={styles.value}>{formatCurrency(totalRevenue, currency, hideValues)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Comprometido</Text>
        <Text style={[styles.value, { color: colors.rust }]}>
          − {formatCurrency(committed, currency, hideValues)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
  },
  extraTag: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.jade,
  },
  value: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 15,
    color: colors.paper,
  },
});
