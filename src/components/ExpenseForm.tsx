import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Plus, Check, Calculator, Settings } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import MonthStepper from "./MonthStepper";
import { parseDecimal, formatCurrency, formatCurrencyInput } from "../utils/currency";
import type { ExpenseFormState, FormNotice, Category } from "../types";

type Props = {
  form: ExpenseFormState;
  categories: Category[];
  onChange: (form: ExpenseFormState) => void;
  editingId: string | null;
  onSubmit: () => void;
  onCancel: () => void;
  onOpenCategoryManager: () => void;
  notice: FormNotice;
};

export default function ExpenseForm({
  form,
  categories,
  onChange,
  editingId,
  onSubmit,
  onCancel,
  onOpenCategoryManager,
  notice,
}: Props) {
  const totalValue = parseDecimal(form.value);
  const installments = Math.max(1, parseInt(form.installments, 10) || 1);
  const hasValidTotal = !isNaN(totalValue) && totalValue > 0;
  const monthlyValue = hasValidTotal ? totalValue / installments : 0;

  return (
    <View style={styles.form}>
      <View style={styles.field}>
        <Text style={styles.label}>Nome do gasto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: TV, Celular, Mercado..."
          placeholderTextColor={colors.paperDim}
          value={form.name}
          onChangeText={(t) => onChange({ ...form, name: t })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, { flex: 1 }]}>
          <Text style={styles.label}>Valor total da compra</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            placeholderTextColor={colors.paperDim}
            keyboardType="number-pad"
            value={form.value}
            onChangeText={(t) => onChange({ ...form, value: formatCurrencyInput(t) })}
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

      {hasValidTotal && (
        <View style={styles.calcPreview}>
          <Calculator size={14} color={colors.brass} />
          <Text style={styles.calcPreviewText}>
            {installments > 1
              ? `${installments}x de ${formatCurrency(monthlyValue)} / mês`
              : `${formatCurrency(totalValue)} à vista (gasto único)`}
          </Text>
        </View>
      )}

      {/* Categoria */}
      <View style={styles.field}>
        <View style={styles.categoryHeader}>
          <Text style={styles.label}>Categoria</Text>
          <TouchableOpacity style={styles.manageBtn} onPress={onOpenCategoryManager} hitSlop={6}>
            <Settings size={12} color={colors.brass} />
            <Text style={styles.manageBtnText}>Editar Rótulos</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPills}>
          <TouchableOpacity
            style={[styles.categoryPill, !form.categoryId && styles.categoryPillSelected]}
            onPress={() => onChange({ ...form, categoryId: null })}
          >
            <Text style={[styles.categoryPillText, !form.categoryId && styles.categoryPillTextSelected]}>
              Sem Categoria
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const isSelected = form.categoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  { borderColor: cat.color },
                  isSelected && { backgroundColor: cat.color },
                ]}
                onPress={() => onChange({ ...form, categoryId: cat.id })}
              >
                <View style={[styles.pillDot, { backgroundColor: cat.color }, isSelected && { backgroundColor: "#FFF" }]} />
                <Text style={[styles.categoryPillText, isSelected && { color: "#FFF", fontWeight: "600" }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  calcPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brassSoft,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  calcPreviewText: {
    fontFamily: fonts.monoSemiBold,
    color: colors.brass,
    fontSize: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  manageBtnText: {
    fontSize: 11,
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  categoryPills: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.panel2,
  },
  categoryPillSelected: {
    backgroundColor: colors.paperDim,
    borderColor: colors.paper,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 12,
    color: colors.paperDim,
  },
  categoryPillTextSelected: {
    color: colors.paper,
    fontWeight: "600",
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
