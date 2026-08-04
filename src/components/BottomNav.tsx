import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wallet, LayoutDashboard, Sparkles, TrendingUp, Settings } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";

export type TabType = "budget" | "dashboard" | "simulator" | "investments" | "settings";

type Props = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export default function BottomNav({ activeTab, onTabChange }: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(8, insets.bottom);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
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
          numberOfLines={1}
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
          numberOfLines={1}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "simulator" && styles.tabActive]}
        onPress={() => onTabChange("simulator")}
        activeOpacity={0.8}
      >
        <Sparkles
          size={18}
          color={activeTab === "simulator" ? colors.brass : colors.paperDim}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "simulator" && styles.tabTextActive,
          ]}
          numberOfLines={1}
        >
          Simular
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "investments" && styles.tabActive]}
        onPress={() => onTabChange("investments")}
        activeOpacity={0.8}
      >
        <TrendingUp
          size={18}
          color={activeTab === "investments" ? colors.brass : colors.paperDim}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "investments" && styles.tabTextActive,
          ]}
          numberOfLines={1}
        >
          Investir
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
          numberOfLines={1}
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
    paddingTop: 8,
    paddingHorizontal: 2,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 1,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.brassSoft,
  },
  tabText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 9.5,
    color: colors.paperDim,
  },
  tabTextActive: {
    color: colors.brass,
  },
});
