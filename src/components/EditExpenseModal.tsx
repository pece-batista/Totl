import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Pencil, X } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import ExpenseForm from "./ExpenseForm";
import type { ExpenseFormState, FormNotice, Category, CurrencyCode } from "../types";

type Props = {
  visible: boolean;
  form: ExpenseFormState;
  categories: Category[];
  currency?: CurrencyCode;
  hideValues?: boolean;
  onChange: (form: ExpenseFormState) => void;
  onSubmit: (calculatedMonthlyValue?: number) => void;
  onCancel: () => void;
  onOpenCategoryManager: () => void;
  notice: FormNotice;
};

export default function EditExpenseModal({
  visible,
  form,
  categories,
  currency = "BRL",
  hideValues = false,
  onChange,
  onSubmit,
  onCancel,
  onOpenCategoryManager,
  notice,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.card}>
            {/* Header do Modal */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.iconBg}>
                  <Pencil size={18} color={colors.brass} />
                </View>
                <Text style={styles.title}>Editar Lançamento</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onCancel} hitSlop={8}>
                <X size={18} color={colors.paperDim} />
              </TouchableOpacity>
            </View>

            {/* Conteúdo com Form */}
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ExpenseForm
                form={form}
                categories={categories}
                currency={currency}
                hideValues={hideValues}
                onChange={onChange}
                editingId="modal-edit"
                onSubmit={onSubmit}
                onCancel={onCancel}
                onOpenCategoryManager={onOpenCategoryManager}
                notice={notice}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    maxHeight: "90%",
  },
  card: {
    width: "100%",
    backgroundColor: colors.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    borderBottomWidth: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.brassSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.paper,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  scrollContent: {
    paddingVertical: 8,
  },
});
