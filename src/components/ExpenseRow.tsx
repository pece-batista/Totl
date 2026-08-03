import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency } from "../utils/currency";
import type { ExpenseStatus, Category, CurrencyCode } from "../types";

type Props = {
  name: string;
  meta: string;
  value: number;
  category?: Category | null;
  badge?: ExpenseStatus;
  currency?: CurrencyCode;
  hideValues?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

const badgeColors: Record<ExpenseStatus["tone"], { bg: string; fg: string }> = {
  dim: { bg: colors.panel2, fg: colors.paperDim },
  brass: { bg: colors.brassSoft, fg: colors.brass },
  rust: { bg: colors.rustSoft, fg: colors.rust },
};

export default function ExpenseRow({
  name,
  meta,
  value,
  category,
  badge,
  currency = "BRL",
  hideValues = false,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {category && (
            <View style={[styles.categoryBadge, { borderColor: category.color }]}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}
        </View>
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
        {!badge && <Text style={styles.value}>{formatCurrency(value, currency, hideValues)}</Text>}
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.paper,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 1,
    paddingHorizontal: 6,
    backgroundColor: colors.panel2,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: fonts.monoSemiBold,
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
