import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, Trash2, TrendingUp, ChevronDown, ChevronUp } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency, formatCurrencyInput, parseDecimal } from "../utils/currency";
import type { Income, CurrencyCode } from "../types";

type Props = {
  selectedMonth: string;
  monthLabel: string;
  incomes: Income[];
  currency?: CurrencyCode;
  hideValues?: boolean;
  onAddIncome: (name: string, value: number) => void;
  onDeleteIncome: (id: string) => void;
};

export default function IncomesSection({
  selectedMonth,
  monthLabel,
  incomes,
  currency = "BRL",
  hideValues = false,
  onAddIncome,
  onDeleteIncome,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [valueInput, setValueInput] = useState("");

  const monthIncomes = incomes.filter((i) => i.monthKey === selectedMonth);
  const totalExtra = monthIncomes.reduce((acc, i) => acc + i.value, 0);

  function handleAdd() {
    if (!name.trim()) return;
    const num = parseDecimal(valueInput);
    if (isNaN(num) || num <= 0) return;

    onAddIncome(name.trim(), num);
    setName("");
    setValueInput("");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <TrendingUp size={16} color={colors.jade} />
          <Text style={styles.headerTitle}>Rendas Extras ({monthLabel})</Text>
          {totalExtra > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+ {formatCurrency(totalExtra, currency, hideValues)}</Text>
            </View>
          )}
        </View>
        {expanded ? <ChevronUp size={16} color={colors.paperDim} /> : <ChevronDown size={16} color={colors.paperDim} />}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {monthIncomes.length > 0 ? (
            <View style={styles.list}>
              {monthIncomes.map((item) => (
                <View key={item.id} style={styles.incomeItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.incomeName}>{item.name}</Text>
                    <Text style={styles.incomeSub}>Entrada pontual em {monthLabel}</Text>
                  </View>
                  <Text style={styles.incomeValue}>+ {formatCurrency(item.value, currency, hideValues)}</Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDeleteIncome(item.id)}
                    hitSlop={8}
                  >
                    <Trash2 size={14} color={colors.paperDim} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Nenhuma renda extra cadastrada para {monthLabel}.</Text>
          )}

          {/* Form para adicionar Renda Extra */}
          <View style={styles.addForm}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Ex: Freela, Bônus, Venda..."
                placeholderTextColor={colors.paperDim}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={[styles.input, { flex: 1.2 }]}
                placeholder="0,00"
                placeholderTextColor={colors.paperDim}
                keyboardType="number-pad"
                value={valueInput}
                onChangeText={(t) => setValueInput(formatCurrencyInput(t))}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
                <Plus size={16} color={colors.ink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
  },
  badge: {
    backgroundColor: colors.jadeSoft,
    borderWidth: 1,
    borderColor: colors.jade,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.monoSemiBold,
    color: colors.jade,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 12,
    paddingTop: 12,
  },
  list: {
    gap: 8,
  },
  incomeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 8,
  },
  incomeName: {
    fontSize: 13,
    color: colors.paper,
    fontWeight: "500",
  },
  incomeSub: {
    fontSize: 10,
    color: colors.paperDim,
  },
  incomeValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.jade,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyText: {
    fontSize: 12,
    color: colors.paperDim,
    fontStyle: "italic",
  },
  addForm: {
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: colors.jade,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
