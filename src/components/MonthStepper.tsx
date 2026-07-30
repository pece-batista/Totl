import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { addMonths, monthLabel } from "../utils/date";

type Props = {
  value: string;
  onChange: (monthKey: string) => void;
};

export default function MonthStepper({ value, onChange }: Props) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.arrowBtn}
        onPress={() => onChange(addMonths(value, -1))}
        hitSlop={8}
      >
        <ChevronLeft size={16} color={colors.paperDim} />
      </TouchableOpacity>
      <Text style={styles.label}>{monthLabel(value, "short")}</Text>
      <TouchableOpacity
        style={styles.arrowBtn}
        onPress={() => onChange(addMonths(value, 1))}
        hitSlop={8}
      >
        <ChevronRight size={16} color={colors.paperDim} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  arrowBtn: {
    padding: 4,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.paper,
  },
});
