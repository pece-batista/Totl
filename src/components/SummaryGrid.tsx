import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency } from "../utils/currency";
import type { CurrencyCode } from "../types";

type Props = {
  salary: number;
  committed: number;
  free?: number;
  currency?: CurrencyCode;
};

export default function SummaryGrid({ salary, committed, currency = "BRL" }: Props) {
  return (
    <View style={styles.grid}>
      <View style={styles.stat}>
        <Text style={styles.label}>Salário</Text>
        <Text style={styles.value}>{formatCurrency(salary, currency)}</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.label}>Comprometido</Text>
        <Text style={[styles.value, { color: colors.rust }]}>− {formatCurrency(committed, currency)}</Text>
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
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
    marginBottom: 6,
  },
  value: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 15,
    color: colors.paper,
  },
});
