import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Wallet, LayoutDashboard, Settings } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";

export type TabType = "budget" | "dashboard" | "settings";

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
          size={18}
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
          size={18}
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

      <TouchableOpacity
        style={[styles.tab, activeTab === "settings" && styles.tabActive]}
        onPress={() => onTabChange("settings")}
        activeOpacity={0.8}
      >
        <Settings
          size={18}
          color={activeTab === "settings" ? colors.brass : colors.paperDim}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "settings" && styles.tabTextActive,
          ]}
        >
          Ajustes
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.brassSoft,
  },
  tabText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
    color: colors.paperDim,
  },
  tabTextActive: {
    color: colors.brass,
  },
});
