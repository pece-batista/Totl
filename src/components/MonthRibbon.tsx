import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { colors, fonts } from "../theme/colors";
import { monthLabel } from "../utils/date";
import { formatCurrency } from "../utils/currency";
import type { MonthSummary } from "../types";

const BAR_HEIGHT = 64;

type Props = {
  timeline: MonthSummary[];
  barBase: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export default function MonthRibbon({ timeline, barBase, selectedIndex, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.ribbon}
    >
      {timeline.map((t, i) => {
        const total = Math.max(barBase, 1);
        const freeH = Math.max(0, (t.free / total) * BAR_HEIGHT);
        const commH = Math.min(BAR_HEIGHT, (t.committed / total) * BAR_HEIGHT);
        const active = i === selectedIndex;
        return (
          <TouchableOpacity
            key={t.monthKey}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onSelect(i)}
            activeOpacity={0.8}
          >
            <View style={styles.barTrack}>
              <View style={{ height: freeH, backgroundColor: colors.jade, width: "100%" }} />
              <View style={{ height: commH, backgroundColor: colors.rust, width: "100%" }} />
            </View>
            <Text style={styles.monthLabel}>{monthLabel(t.monthKey)}</Text>
            <Text style={styles.monthFree}>
              {t.free >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(t.free)).replace("R$", "").trim()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    gap: 8,
    paddingBottom: 10,
  },
  card: {
    width: 64,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  cardActive: {
    borderColor: colors.brass,
    backgroundColor: colors.brassSoft,
  },
  barTrack: {
    width: 20,
    height: BAR_HEIGHT,
    backgroundColor: colors.panel2,
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.paper,
    marginBottom: 2,
  },
  monthFree: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.paperDim,
  },
});
