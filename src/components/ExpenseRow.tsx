import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency } from "../utils/currency";
import type { ExpenseStatus } from "../types";

type Props = {
  name: string;
  meta: string;
  value: number;
  badge?: ExpenseStatus;
  onEdit: () => void;
  onDelete: () => void;
};

const badgeColors: Record<ExpenseStatus["tone"], { bg: string; fg: string }> = {
  dim: { bg: colors.panel2, fg: colors.paperDim },
  brass: { bg: colors.brassSoft, fg: colors.brass },
  rust: { bg: colors.rustSoft, fg: colors.rust },
};

export default function ExpenseRow({ name, meta, value, badge, onEdit, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta} numberOfLines={1}>{meta}</Text>
      </View>
      <View style={styles.right}>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColors[badge.tone].bg }]}>
            <Text style={[styles.badgeText, { color: badgeColors[badge.tone].fg }]}>
              {badge.label}
            </Text>
          </View>
        )}
        {!badge && <Text style={styles.value}>{formatCurrency(value)}</Text>}
        <TouchableOpacity style={styles.iconBtn} onPress={onEdit} hitSlop={8}>
          <Pencil size={14} color={colors.paperDim} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onDelete} hitSlop={8}>
          <Trash2 size={14} color={colors.paperDim} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  main: {
    flexShrink: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.paper,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.paperDim,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  value: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.paper,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  iconBtn: {
    padding: 4,
  },
});
