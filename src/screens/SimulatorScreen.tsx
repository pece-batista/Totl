import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Sparkles,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
} from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { todayMonthKey, monthLabel, monthDiff } from "../utils/date";
import { formatCurrency, formatCurrencyInput, parseDecimal } from "../utils/currency";
import MonthStepper from "../components/MonthStepper";
import SectionLabel from "../components/SectionLabel";
import type { Expense, CurrencyCode, Category } from "../types";

type Props = {
  salary: number;
  expenses: Expense[];
  categories: Category[];
  currency?: CurrencyCode;
  hideValues?: boolean;
  onCommitExpense: (name: string, value: number, installments: number, startMonth: string) => Promise<void>;
};

export default function SimulatorScreen({
  salary,
  expenses,
  categories,
  currency = "BRL",
  hideValues = false,
  onCommitExpense,
}: Props) {
  const [name, setName] = useState("PlayStation 5");
  const [valueInput, setValueInput] = useState("3.800,00");
  const [valueMode, setValueMode] = useState<"total" | "installment">("total");
  const [installmentsInput, setInstallmentsInput] = useState("10");
  const [startMonth, setStartMonth] = useState(todayMonthKey());
  const [committing, setCommitting] = useState(false);

  const rawValue = parseDecimal(valueInput);
  const installments = Math.max(1, parseInt(installmentsInput, 10) || 1);
  const hasValidValue = !isNaN(rawValue) && rawValue > 0;

  let totalValue = 0;
  let monthlyValue = 0;

  if (hasValidValue) {
    if (valueMode === "installment") {
      monthlyValue = rawValue;
      totalValue = rawValue * installments;
    } else {
      totalValue = rawValue;
      monthlyValue = rawValue / installments;
    }
  }

  // Gastos atuais no mês de início da simulação
  const currentCommitted = useMemo(() => {
    let sum = 0;
    for (const e of expenses) {
      const diff = monthDiff(e.startMonth, startMonth);
      if (diff >= 0 && diff < e.installments) {
        sum += e.value;
      }
    }
    return sum;
  }, [expenses, startMonth]);

  const currentFree = salary - currentCommitted;
  const currentPercent = salary > 0 ? (currentCommitted / salary) * 100 : 0;

  // Com a Simulação
  const simulatedCommitted = currentCommitted + monthlyValue;
  const simulatedFree = salary - simulatedCommitted;
  const simulatedPercent = salary > 0 ? (simulatedCommitted / salary) * 100 : 0;

  // Avaliação de Saúde Financeira
  const healthStatus = useMemo(() => {
    if (simulatedPercent <= 50) {
      return {
        label: "Orçamento Saudável 🟢",
        color: colors.jade,
        sub: "A simulação compromete menos de 50% da sua renda mensal.",
        icon: CheckCircle2,
      };
    } else if (simulatedPercent <= 75) {
      return {
        label: "Atenção ao Comprometimento 🟡",
        color: colors.brass,
        sub: "Comprometimento moderado (entre 50% e 75%). Avalie suas reservas.",
        icon: AlertTriangle,
      };
    } else {
      return {
        label: "Risco de Apertar Finanças 🔴",
        color: colors.rust,
        sub: "Comprometimento elevado (acima de 75%). Risco de saldo negativo.",
        icon: AlertTriangle,
      };
    }
  }, [simulatedPercent]);

  async function handleCommitToReal() {
    if (!name.trim()) {
      Alert.alert("Aviso", "Dê um nome para a compra simulada.");
      return;
    }
    if (!hasValidValue) {
      Alert.alert("Aviso", "Informe um valor válido.");
      return;
    }

    setCommitting(true);
    await onCommitExpense(name.trim(), monthlyValue, installments, startMonth);
    setCommitting(false);
    Alert.alert("Sucesso 🚀", `"${name}" foi adicionado ao seu orçamento real!`);
  }

  const HealthIcon = healthStatus.icon;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Sparkles size={22} color={colors.brass} />
            <Text style={styles.title}>Simulador</Text>
          </View>
          <Text style={styles.subtitle}>
            Simule o impacto de novas compras sem alterar seu orçamento real
          </Text>
        </View>

        {/* 1. FORMULÁRIO DE SIMULAÇÃO */}
        <SectionLabel>1. Parâmetros da Compra Simulada</SectionLabel>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>O que você quer comprar?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: PlayStation 5, Viagem, Celular..."
              placeholderTextColor={colors.paperDim}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Toggle de Modo de Valor */}
          <View style={styles.valueModeRow}>
            <Text style={styles.label}>Modo de Valor:</Text>
            <View style={styles.modeToggleGroup}>
              <TouchableOpacity
                style={[styles.modeToggleBtn, valueMode === "total" && styles.modeToggleBtnActive]}
                onPress={() => setValueMode("total")}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeToggleText, valueMode === "total" && styles.modeToggleTextActive]}>
                  Valor Total
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeToggleBtn, valueMode === "installment" && styles.modeToggleBtnActive]}
                onPress={() => setValueMode("installment")}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeToggleText, valueMode === "installment" && styles.modeToggleTextActive]}>
                  Por Parcela
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label} numberOfLines={1}>
                {valueMode === "installment" ? "Valor de cada parcela" : "Valor total da compra"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor={colors.paperDim}
                keyboardType="number-pad"
                value={valueInput}
                onChangeText={(t) => setValueInput(formatCurrencyInput(t))}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label} numberOfLines={1}>Parcelas (1 = à vista)</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                placeholderTextColor={colors.paperDim}
                keyboardType="number-pad"
                value={installmentsInput}
                onChangeText={(t) => setInstallmentsInput(t.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mês Inicial da Compra</Text>
            <MonthStepper value={startMonth} onChange={setStartMonth} />
          </View>
        </View>

        {/* 2. ANÁLISE DE IMPACTO ANTES VS DEPOIS */}
        <SectionLabel>2. Impacto no Mês de {monthLabel(startMonth)}</SectionLabel>

        {/* Card de Saúde Financeira */}
        <View style={[styles.healthCard, { borderColor: healthStatus.color }]}>
          <View style={styles.healthHeader}>
            <HealthIcon size={20} color={healthStatus.color} />
            <Text style={[styles.healthTitle, { color: healthStatus.color }]}>
              {healthStatus.label}
            </Text>
          </View>
          <Text style={styles.healthSub}>{healthStatus.sub}</Text>
        </View>

        {/* Grid Comparativo */}
        <View style={styles.compareGrid}>
          {/* Card Atual */}
          <View style={styles.compareCard}>
            <Text style={styles.compareHeader}>ATUAL</Text>
            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Comprometido</Text>
              <Text style={styles.compareValue}>
                {formatCurrency(currentCommitted, currency, hideValues)}
              </Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Comprometimento</Text>
              <Text style={styles.compareValue}>{currentPercent.toFixed(1)}%</Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Saldo Livre</Text>
              <Text style={[styles.compareValue, { color: colors.jade }]}>
                {formatCurrency(currentFree, currency, hideValues)}
              </Text>
            </View>
          </View>

          <View style={styles.arrowBox}>
            <ArrowRight size={18} color={colors.paperDim} />
          </View>

          {/* Card Simulado */}
          <View style={[styles.compareCard, styles.compareCardSimulated]}>
            <Text style={[styles.compareHeader, { color: colors.brass }]}>COM A COMPRA</Text>
            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Novo Comprometido</Text>
              <Text style={[styles.compareValue, { color: colors.rust }]}>
                {formatCurrency(simulatedCommitted, currency, hideValues)}
              </Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Novo Comprometimento</Text>
              <Text style={[styles.compareValue, { color: healthStatus.color }]}>
                {simulatedPercent.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.compareRow}>
              <Text style={styles.compareLabel}>Novo Saldo Livre</Text>
              <Text style={[styles.compareValue, { color: simulatedFree >= 0 ? colors.jade : colors.rust }]}>
                {formatCurrency(simulatedFree, currency, hideValues)}
              </Text>
            </View>
          </View>
        </View>

        {/* Resumo da Parcela Simulada */}
        {hasValidValue && (
          <View style={styles.summaryBox}>
            <Calculator size={16} color={colors.brass} />
            <Text style={styles.summaryText}>
              A compra de <Text style={{ color: colors.paper, fontWeight: "600" }}>{name || "Item"}</Text> adicionará{" "}
              <Text style={{ color: colors.brass }}>{installments}x de {formatCurrency(monthlyValue, currency, hideValues)} / mês</Text>{" "}
              (Total: {formatCurrency(totalValue, currency, hideValues)}).
            </Text>
          </View>
        )}

        {/* 3. AÇÃO: EFETIVAR NO ORÇAMENTO REAL */}
        <TouchableOpacity
          style={styles.commitBtn}
          onPress={handleCommitToReal}
          disabled={committing || !hasValidValue}
          activeOpacity={0.85}
        >
          <PlusCircle size={18} color={colors.ink} />
          <Text style={styles.commitBtnText}>
            Efetivar e Adicionar ao Orçamento Real 🚀
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 18,
    marginBottom: 22,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.paper,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: colors.paperDim,
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
  },
  input: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  valueModeRow: {
    gap: 6,
  },
  modeToggleGroup: {
    flexDirection: "row",
    backgroundColor: colors.panel2,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.brassSoft,
    borderColor: colors.brass,
    borderWidth: 1,
  },
  modeToggleText: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  modeToggleTextActive: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  healthCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 4,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  healthTitle: {
    fontSize: 14,
    fontFamily: fonts.monoSemiBold,
  },
  healthSub: {
    fontSize: 11,
    color: colors.paperDim,
    marginLeft: 28,
  },
  compareGrid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  compareCard: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  compareCardSimulated: {
    borderColor: colors.brass,
    backgroundColor: colors.brassSoft,
  },
  arrowBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  compareHeader: {
    fontSize: 9,
    fontFamily: fonts.monoSemiBold,
    letterSpacing: 1,
    color: colors.paperDim,
    marginBottom: 4,
  },
  compareRow: {
    gap: 2,
  },
  compareLabel: {
    fontSize: 10,
    color: colors.paperDim,
  },
  compareValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.paper,
  },
  summaryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 12,
    color: colors.paperDim,
    flex: 1,
    lineHeight: 18,
  },
  commitBtn: {
    backgroundColor: colors.brass,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  commitBtnText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.ink,
  },
});
