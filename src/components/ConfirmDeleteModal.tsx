import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { Trash2 } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency } from "../utils/currency";
import type { CurrencyCode } from "../types";

type Props = {
  visible: boolean;
  itemName?: string;
  itemValue?: number;
  currency?: CurrencyCode;
  hideValues?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  visible,
  itemName = "",
  itemValue,
  currency = "BRL",
  hideValues = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBg}>
            <Trash2 size={24} color={colors.rust} />
          </View>

          <Text style={styles.title}>Apagar Lançamento?</Text>

          <Text style={styles.message}>
            Tem certeza que deseja apagar o gasto{" "}
            <Text style={styles.highlightName}>"{itemName}"</Text>
            {itemValue !== undefined && (
              <>
                {" "}no valor de{" "}
                <Text style={styles.highlightValue}>
                  {formatCurrency(itemValue, currency, hideValues)}
                </Text>
              </>
            )}
            ? Esta ação removerá o lançamento do seu orçamento.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.rust} />
              ) : (
                <Text style={styles.confirmText}>Sim, Apagar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.rustSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.paper,
    textAlign: "center",
  },
  message: {
    fontSize: 13,
    color: colors.paperDim,
    textAlign: "center",
    lineHeight: 20,
  },
  highlightName: {
    color: colors.paper,
    fontFamily: fonts.monoSemiBold,
  },
  highlightValue: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    color: colors.paperDim,
    fontSize: 13,
    fontFamily: fonts.monoSemiBold,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.rustSoft,
    borderWidth: 1,
    borderColor: colors.rust,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmText: {
    color: colors.rust,
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
  },
});
