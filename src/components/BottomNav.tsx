import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Wallet, LayoutDashboard } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";

export type TabType = "budget" | "dashboard";

type Props = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "budget" && styles.tabActive]}
        onPress={() => onTabChange("budget")}
        activeOpacity={0.8}
      >
        <Wallet
          size={20}
          color={activeTab === "budget" ? colors.brass : colors.paperDim}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "budget" && styles.tabTextActive,
          ]}
        >
          Orçamento
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "dashboard" && styles.tabActive]}
        onPress={() => onTabChange("dashboard")}
        activeOpacity={0.8}
      >
        <LayoutDashboard
          size={20}
          color={activeTab === "dashboard" ? colors.brass : colors.paperDim}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "dashboard" && styles.tabTextActive,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.brassSoft,
  },
  tabText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.paperDim,
  },
  tabTextActive: {
    color: colors.brass,
  },
});
