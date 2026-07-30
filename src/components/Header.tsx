import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Pencil, Check, X } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency, parseDecimal } from "../utils/currency";

type Props = {
  salary: number;
  onSave: (value: number) => void;
};

export default function Header({ salary, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function startEdit() {
    setDraft(salary ? String(salary).replace(".", ",") : "");
    setEditing(true);
  }

  function confirm() {
    const value = parseDecimal(draft);
    if (!isNaN(value) && value >= 0) {
      onSave(value);
      setEditing(false);
    }
  }

  return (
    <View style={styles.header}>
      <View style={{ flexShrink: 1 }}>
        <Text style={styles.title}>Meu Orçamento</Text>
        <Text style={styles.subtitle}>Salário fixo menos parcelas e gastos previstos</Text>
      </View>
      <View style={styles.salaryBox}>
        <Text style={styles.salaryLabel}>Salário fixo mensal</Text>
        {editing ? (
          <View style={styles.salaryEditRow}>
            <TextInput
              style={styles.salaryInput}
              value={draft}
              onChangeText={setDraft}
              keyboardType="decimal-pad"
              autoFocus
              onSubmitEditing={confirm}
              placeholder="0,00"
              placeholderTextColor={colors.paperDim}
            />
            <TouchableOpacity style={styles.iconBtn} onPress={confirm} hitSlop={8}>
              <Check size={16} color={colors.jade} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setEditing(false)} hitSlop={8}>
              <X size={16} color={colors.rust} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.salaryEditRow}>
            <Text style={styles.salaryValue}>{formatCurrency(salary)}</Text>
            <TouchableOpacity style={styles.iconBtn} onPress={startEdit} hitSlop={8}>
              <Pencil size={14} color={colors.paperDim} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 18,
    marginBottom: 22,
    gap: 12,
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
  salaryBox: {
    alignItems: "flex-end",
  },
  salaryLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.paperDim,
    marginBottom: 4,
  },
  salaryEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  salaryValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 18,
    color: colors.paper,
  },
  salaryInput: {
    fontFamily: fonts.mono,
    fontSize: 15,
    color: colors.paper,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 100,
    textAlign: "right",
  },
  iconBtn: {
    padding: 4,
    borderRadius: 6,
  },
});
