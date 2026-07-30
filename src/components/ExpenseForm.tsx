import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Plus, Check } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import MonthStepper from "./MonthStepper";
import type { ExpenseFormState, FormNotice } from "../types";

type Props = {
  form: ExpenseFormState;
  onChange: (form: ExpenseFormState) => void;
  editingId: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  notice: FormNotice;
};

export default function ExpenseForm({ form, onChange, editingId, onSubmit, onCancel, notice }: Props) {
  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Notebook, Streaming..."
          placeholderTextColor={colors.paperDim}
          value={form.name}
          onChangeText={(t) => onChange({ ...form, name: t })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Valor da parcela</Text>
          <TextInput
            style={styles.input}
            placeholder="150,00"
            placeholderTextColor={colors.paperDim}
            keyboardType="decimal-pad"
            value={form.value}
            onChangeText={(t) => onChange({ ...form, value: t })}
          />
        </View>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Parcelas (1 = à vista)</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={colors.paperDim}
            keyboardType="number-pad"
            value={form.installments}
            onChangeText={(t) => onChange({ ...form, installments: t.replace(/[^0-9]/g, "") })}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mês inicial</Text>
        <MonthStepper
          value={form.startMonth}
          onChange={(monthKey) => onChange({ ...form, startMonth: monthKey })}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} activeOpacity={0.85}>
          {editingId ? <Check size={14} color={colors.ink} /> : <Plus size={14} color={colors.ink} />}
          <Text style={styles.submitText}>{editingId ? "Salvar" : "Adicionar"}</Text>
        </TouchableOpacity>
        {editingId && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.85}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {notice && (
        <View
          style={[
            styles.notice,
            notice.type === "error" ? styles.noticeError : styles.noticeSuccess,
          ]}
        >
          <Text style={notice.type === "error" ? styles.noticeErrorText : styles.noticeSuccessText}>
            {notice.text}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
  },
  input: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  submitBtn: {
    backgroundColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  submitText: {
    color: colors.ink,
    fontWeight: "600",
    fontSize: 13,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: colors.paperDim,
    fontSize: 13,
  },
  notice: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  noticeError: {
    backgroundColor: colors.rustSoft,
    borderColor: colors.rust,
  },
  noticeSuccess: {
    backgroundColor: colors.jadeSoft,
    borderColor: colors.jade,
  },
  noticeErrorText: {
    color: colors.rust,
    fontSize: 13,
  },
  noticeSuccessText: {
    color: colors.jade,
    fontSize: 13,
  },
});
