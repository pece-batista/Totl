import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.paperDim,
    marginBottom: 10,
  },
});
