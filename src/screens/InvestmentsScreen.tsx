import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  Sparkles,
  Zap,
  RefreshCw,
  Award,
  Info,
  Layers,
  Building2,
  Landmark,
  CheckCircle2,
  ThumbsUp,
  DollarSign,
  ShieldCheck,
} from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { formatCurrency, formatCurrencyInput, parseDecimal } from "../utils/currency";
import { fetchBcbRates, type BcbRates } from "../services/bcb";
import {
  INVESTMENT_PRESETS,
  calculateInvestmentProjection,
  type PresetType,
  type CategoryType,
} from "../utils/investments";
import SectionLabel from "../components/SectionLabel";
import type { CurrencyCode } from "../types";

type Props = {
  freeBalance?: number;
  currency?: CurrencyCode;
  hideValues?: boolean;
};

const PERIOD_OPTIONS = [
  { label: "6 meses", months: 6 },
  { label: "1 ano", months: 12 },
  { label: "2 anos", months: 24 },
  { label: "3 anos", months: 36 },
  { label: "5 anos", months: 60 },
  { label: "10 anos", months: 120 },
];

type CategoryFilter = "all" | CategoryType;
type GoalType = "profit" | "purpose";

export default function InvestmentsScreen({
  freeBalance = 0,
  currency = "BRL",
  hideValues = false,
}: Props) {
  const [rates, setRates] = useState<BcbRates | null>(null);
  const [loadingRates, setLoadingRates] = useState(true);

  // Form State - Iniciamos no topo com os valores!
  const [initialInput, setInitialInput] = useState("0,00");
  const [monthlyInput, setMonthlyInput] = useState(
    formatCurrencyInput(String(Math.round(Math.max(0, freeBalance) * 100)))
  );
  const [simulationGoal, setSimulationGoal] = useState<GoalType>("profit");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedPresetId, setSelectedPresetId] = useState<PresetType>("cdi100");
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [customValueInput, setCustomValueInput] = useState("3");
  const [customUnit, setCustomUnit] = useState<"months" | "years">("years");

  const presetScrollRef = useRef<ScrollView>(null);

  // Quando o filtro de categoria muda, reseta a rolagem do carrossel para o início (esquerda)
  useEffect(() => {
    presetScrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [categoryFilter]);

  // Carrega taxas oficiais da API do Banco Central
  async function loadRates() {
    setLoadingRates(true);
    const data = await fetchBcbRates();
    setRates(data);
    setLoadingRates(false);
  }

  useEffect(() => {
    loadRates();
  }, []);

  const initialAmount = useMemo(() => parseDecimal(initialInput) || 0, [initialInput]);
  const monthlyContribution = useMemo(() => parseDecimal(monthlyInput) || 0, [monthlyInput]);

  // Motor de Recomendação Inteligente (Decision Tree Adaptativa)
  const recommendation = useMemo(() => {
    const selic = rates?.selicRate || 10.5;
    const poupanca = rates?.poupancaRate || 6.17;

    const allCalculated = INVESTMENT_PRESETS.map((preset) => {
      const proj = calculateInvestmentProjection(
        initialAmount,
        monthlyContribution,
        selectedMonths,
        selic,
        poupanca,
        preset
      );
      return { preset, proj };
    });

    // Ordena por maior retorno líquido
    allCalculated.sort((a, b) => b.proj.netTotal - a.proj.netTotal);

    let recPresetId: PresetType = "cdi100";
    let reason = "";

    if (simulationGoal === "profit") {
      const topPreset = allCalculated[0];
      recPresetId = topPreset.preset.id;
      reason = `Projeta o MAIOR retorno líquido acumulado ao final de ${selectedMonths} meses (${formatCurrency(topPreset.proj.netProfit, currency, hideValues)} de lucro limpo), maximizando seus juros compostos.`;
    } else {
      if (selectedMonths <= 6) {
        recPresetId = "cdi100";
        reason =
          "Para prazos curtos (até 6 meses), a Caixinha 100% CDI ou Tesouro Selic garante alta liquidez diária sem volatilidade ou riscos de oscilação.";
      } else if (selectedMonths <= 12) {
        const lci = allCalculated.find((r) => r.preset.id === "lci_lca");
        if (lci && lci.proj.netTotal >= allCalculated[0].proj.netTotal * 0.98) {
          recPresetId = "lci_lca";
          reason =
            "Para até 1 ano, a LCI/LCA é isenta de Imposto de Renda, garantindo retorno líquido superior sem descontos no resgate.";
        } else {
          recPresetId = "cdi100";
          reason =
            "Para até 1 ano, a Caixinha 100% CDI oferece excelente rentabilidade com total flexibilidade de resgate.";
        }
      } else if (selectedMonths <= 36) {
        recPresetId = "tesouro_ipca";
        reason =
          "Para médio prazo (1 a 3 anos), o Tesouro IPCA+ protege seu dinheiro contra a inflação e atinge alíquotas reduzidas de IR (17,5% ou 15%).";
      } else if (selectedMonths <= 60) {
        recPresetId = "tesouro_ipca";
        reason =
          "Para prazos de 3 a 5 anos, o Tesouro IPCA+ garante ganho real acima da inflação com a alíquota mínima de Imposto de Renda (15%).";
      } else {
        recPresetId = "tesouro_renda";
        reason =
          "Para longíssimo prazo (10 anos+), o Tesouro RendA+ é a melhor opção para construir aposentadoria extra com parcelas mensais corrigidas pela inflação.";
      }
    }

    const recPreset = INVESTMENT_PRESETS.find((p) => p.id === recPresetId) || allCalculated[0].preset;
    const recProj = allCalculated.find((r) => r.preset.id === recPreset.id)?.proj || allCalculated[0].proj;

    return {
      recPreset,
      recProj,
      reason,
      rankedList: allCalculated,
    };
  }, [initialAmount, monthlyContribution, selectedMonths, rates, simulationGoal, currency, hideValues]);

  const filteredPresets = useMemo(() => {
    if (categoryFilter === "all") return INVESTMENT_PRESETS;
    return INVESTMENT_PRESETS.filter((p) => p.category === categoryFilter);
  }, [categoryFilter]);

  const selectedPreset = useMemo(
    () => INVESTMENT_PRESETS.find((p) => p.id === selectedPresetId) || INVESTMENT_PRESETS[0],
    [selectedPresetId]
  );

  // Projeção do produto selecionado pelo usuário
  const projection = useMemo(() => {
    const selic = rates?.selicRate || 10.5;
    const poupanca = rates?.poupancaRate || 6.17;
    return calculateInvestmentProjection(
      initialAmount,
      monthlyContribution,
      selectedMonths,
      selic,
      poupanca,
      selectedPreset
    );
  }, [initialAmount, monthlyContribution, selectedMonths, rates, selectedPreset]);

  function handleUseFreeBalance() {
    const cents = Math.round(Math.max(0, freeBalance) * 100);
    setMonthlyInput(formatCurrencyInput(String(cents)));
  }

  function handleApplyRecommendation() {
    setSelectedPresetId(recommendation.recPreset.id);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TrendingUp size={24} color={colors.brass} />
            <Text style={styles.title}>Simulador de Investimentos</Text>
          </View>
          <Text style={styles.subtitle}>
            Insira o valor e o prazo para receber a recomendação ideal e simular rendimentos reais
          </Text>
        </View>

        {/* Banner de Taxas Oficiais (API Banco Central) */}
        <View style={styles.rateBanner}>
          <View style={styles.rateHeader}>
            <View style={styles.rateTitleGroup}>
              <Award size={16} color={colors.brass} />
              <Text style={styles.rateTitle} numberOfLines={1} adjustsFontSizeToFit>
                Taxas Oficiais (Banco Central do Brasil)
              </Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={loadRates} disabled={loadingRates}>
              {loadingRates ? (
                <ActivityIndicator size="small" color={colors.brass} />
              ) : (
                <RefreshCw size={14} color={colors.brass} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.rateGrid}>
            <View style={styles.rateCard}>
              <Text style={styles.rateLabel}>SELIC / CDI</Text>
              <Text style={styles.rateValue} numberOfLines={1} adjustsFontSizeToFit>
                {rates?.selicRate.toFixed(2).replace(".", ",")}% a.a.
              </Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={styles.rateLabel}>POUPANÇA</Text>
              <Text style={styles.rateValue} numberOfLines={1} adjustsFontSizeToFit>
                {rates?.poupancaRate.toFixed(2).replace(".", ",")}% a.a.
              </Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={styles.rateLabel}>INFLAÇÃO (IPCA)</Text>
              <Text style={styles.rateValue} numberOfLines={1} adjustsFontSizeToFit>
                ~{rates?.ipcaRate.toFixed(2).replace(".", ",")}% a.a.
              </Text>
            </View>
          </View>
        </View>

        {/* PASSO 1: QUANTO VOCÊ QUER APLICAR E PRAZO (AGORA EM PRIMEIRO LUGAR!) */}
        <SectionLabel>1. Quanto você quer aplicar e por quanto tempo?</SectionLabel>
        <View style={styles.inputCard}>
          {/* Seletor do Objetivo Principal */}
          <View style={styles.goalSection}>
            <Text style={styles.fieldLabel}>Qual o seu objetivo principal?</Text>
            <View style={styles.goalToggleGroup}>
              <TouchableOpacity
                style={[styles.goalToggleBtn, simulationGoal === "profit" && styles.goalToggleBtnActive]}
                onPress={() => setSimulationGoal("profit")}
                activeOpacity={0.8}
              >
                <DollarSign size={13} color={simulationGoal === "profit" ? colors.brass : colors.paperDim} />
                <Text style={[styles.goalToggleText, simulationGoal === "profit" && styles.goalToggleTextActive]}>
                  Maior Retorno
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.goalToggleBtn, simulationGoal === "purpose" && styles.goalToggleBtnActive]}
                onPress={() => setSimulationGoal("purpose")}
                activeOpacity={0.8}
              >
                <ShieldCheck size={13} color={simulationGoal === "purpose" ? colors.brass : colors.paperDim} />
                <Text style={[styles.goalToggleText, simulationGoal === "purpose" && styles.goalToggleTextActive]}>
                  Reserva & Futuro
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Aplicação Inicial</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={initialInput}
                onChangeText={(t) => setInitialInput(formatCurrencyInput(t))}
                placeholder="0,00"
                placeholderTextColor={colors.paperDim}
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <View style={styles.monthlyLabelRow}>
                <Text style={styles.fieldLabel}>Aporte Mensal</Text>
              </View>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={monthlyInput}
                onChangeText={(t) => setMonthlyInput(formatCurrencyInput(t))}
                placeholder="0,00"
                placeholderTextColor={colors.paperDim}
              />
            </View>
          </View>

          {/* Botão Atalho Saldo Livre */}
          {freeBalance > 0 && (
            <TouchableOpacity style={styles.useFreeBtn} onPress={handleUseFreeBalance} activeOpacity={0.8}>
              <Sparkles size={14} color={colors.brass} />
              <Text style={styles.useFreeText}>
                Usar meu Saldo Livre ({formatCurrency(freeBalance, currency, hideValues)})
              </Text>
            </TouchableOpacity>
          )}

          {/* Seletor de Período */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Período de Investimento</Text>
          <View style={styles.periodGrid}>
            {PERIOD_OPTIONS.map((item) => {
              const isSelected = !isCustomPeriod && selectedMonths === item.months;
              return (
                <TouchableOpacity
                  key={item.months}
                  style={[styles.periodBtn, isSelected && styles.periodBtnSelected]}
                  onPress={() => {
                    setIsCustomPeriod(false);
                    setSelectedMonths(item.months);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.periodText, isSelected && styles.periodTextSelected]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.periodBtn, isCustomPeriod && styles.periodBtnSelected]}
              onPress={() => {
                setIsCustomPeriod(true);
                const num = parseInt(customValueInput, 10) || 3;
                setSelectedMonths(customUnit === "years" ? num * 12 : num);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, isCustomPeriod && styles.periodTextSelected]}>Outro (personalizado)</Text>
            </TouchableOpacity>
          </View>

          {/* Campo de Período Personalizado com Alternador Meses vs Anos */}
          {isCustomPeriod && (
            <View style={styles.customPeriodBox}>
              <Text style={styles.fieldLabel}>Digitar período personalizado</Text>
              <View style={styles.customPeriodRow}>
                <TextInput
                  style={styles.customInput}
                  keyboardType="number-pad"
                  value={customValueInput}
                  onChangeText={(t) => {
                    const cleaned = t.replace(/[^0-9]/g, "");
                    setCustomValueInput(cleaned);
                    const num = parseInt(cleaned, 10);
                    if (!isNaN(num) && num > 0) {
                      setSelectedMonths(customUnit === "years" ? num * 12 : num);
                    }
                  }}
                  placeholder={customUnit === "years" ? "Ex: 3" : "Ex: 18"}
                  placeholderTextColor={colors.paperDim}
                />

                <View style={styles.unitToggleGroup}>
                  <TouchableOpacity
                    style={[styles.unitToggleBtn, customUnit === "months" && styles.unitToggleBtnActive]}
                    onPress={() => {
                      setCustomUnit("months");
                      const num = parseInt(customValueInput, 10);
                      if (!isNaN(num) && num > 0) {
                        setSelectedMonths(num);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitToggleText, customUnit === "months" && styles.unitToggleTextActive]}>
                      Meses
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.unitToggleBtn, customUnit === "years" && styles.unitToggleBtnActive]}
                    onPress={() => {
                      setCustomUnit("years");
                      const num = parseInt(customValueInput, 10);
                      if (!isNaN(num) && num > 0) {
                        setSelectedMonths(num * 12);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.unitToggleText, customUnit === "years" && styles.unitToggleTextActive]}>
                      Anos
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.customPeriodText}>
                Equivale a {selectedMonths} {selectedMonths === 1 ? "mês" : "meses"}
                {selectedMonths >= 12 ? ` (~${(selectedMonths / 12).toFixed(1).replace(".0", "")} ${selectedMonths === 12 ? "ano" : "anos"})` : ""}
              </Text>
            </View>
          )}
        </View>

        {/* CARD DE RECOMENDAÇÃO INTELIGENTE TOTL (GERADO AUTOMATICAMENTE!) */}
        <View style={styles.recommendationCard}>
          <View style={styles.recHeader}>
            <View style={styles.recBadgeTitle}>
              <ThumbsUp size={16} color={colors.brass} />
              <Text style={styles.recTitleText}>Recomendação Inteligente do Totl</Text>
            </View>
          </View>

          <View style={styles.recBody}>
            <Text style={styles.recName}>{recommendation.recPreset.name}</Text>
            <Text style={styles.recReason}>{recommendation.reason}</Text>
          </View>

          <View style={styles.recMetricsRow}>
            <View style={styles.recMetricItem}>
              <Text style={styles.recMetricLabel}>Estimativa Líquida</Text>
              <Text style={styles.recMetricValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatCurrency(recommendation.recProj.netTotal, currency, hideValues)}
              </Text>
            </View>
            <View style={styles.recMetricItem}>
              <Text style={styles.recMetricLabel}>Lucro Limpo</Text>
              <Text style={[styles.recMetricValue, { color: colors.jade }]} numberOfLines={1} adjustsFontSizeToFit>
                +{formatCurrency(recommendation.recProj.netProfit, currency, hideValues)}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.applyRecBtnFull} onPress={handleApplyRecommendation} activeOpacity={0.8}>
            <CheckCircle2 size={15} color={colors.ink} />
            <Text style={styles.applyRecBtnFullText}>Selecionar Este Investimento</Text>
          </TouchableOpacity>
        </View>

        {/* PASSO 2: EXPLORAR OUTROS INVESTIMENTOS */}
        <SectionLabel>2. Explore ou troque a opção de investimento</SectionLabel>

        {/* Abas de Filtro de Categoria (Deslizante na horizontal) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          <TouchableOpacity
            style={[styles.filterBtn, categoryFilter === "all" && styles.filterBtnActive]}
            onPress={() => setCategoryFilter("all")}
          >
            <Text style={[styles.filterText, categoryFilter === "all" && styles.filterTextActive]}>
              Todos os Produtos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, categoryFilter === "bank" && styles.filterBtnActive]}
            onPress={() => setCategoryFilter("bank")}
          >
            <Building2 size={13} color={categoryFilter === "bank" ? colors.brass : colors.paperDim} />
            <Text style={[styles.filterText, categoryFilter === "bank" && styles.filterTextActive]}>
              Bancos & Caixinhas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, categoryFilter === "tesouro" && styles.filterBtnActive]}
            onPress={() => setCategoryFilter("tesouro")}
          >
            <Landmark size={13} color={categoryFilter === "tesouro" ? colors.brass : colors.paperDim} />
            <Text style={[styles.filterText, categoryFilter === "tesouro" && styles.filterTextActive]}>
              Tesouro Direto
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Carrossel de Presets */}
        <ScrollView
          ref={presetScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetList}
        >
          {filteredPresets.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            const isRecommended = preset.id === recommendation.recPreset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  isSelected && styles.presetCardSelected,
                  isRecommended && !isSelected && styles.presetCardRecommendedBorder,
                ]}
                onPress={() => setSelectedPresetId(preset.id)}
                activeOpacity={0.8}
              >
                <View style={styles.presetHeader}>
                  {isRecommended ? (
                    <View style={styles.recommendedPill}>
                      <Text style={styles.recommendedPillText}>Ideal</Text>
                    </View>
                  ) : preset.isTaxFree ? (
                    <View style={styles.taxFreeBadge}>
                      <Text style={styles.taxFreeText}>Isento IR</Text>
                    </View>
                  ) : (
                    <View style={styles.objectiveBadge}>
                      <Text style={styles.objectiveText} numberOfLines={1}>
                        {preset.objective}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.presetName, isSelected && styles.presetNameSelected]} numberOfLines={1}>
                  {preset.name}
                </Text>
                <Text style={styles.presetSub} numberOfLines={2}>
                  {preset.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Box Informativo Didático do Produto Selecionado */}
        {selectedPreset && (
          <View style={styles.infoProductCard}>
            <View style={styles.infoProductHeader}>
              <Zap size={15} color={colors.brass} />
              <Text style={styles.infoProductTitle}>{selectedPreset.name}</Text>
              <View style={styles.categoryBadgeTag}>
                <Text style={styles.categoryBadgeTagText}>
                  {selectedPreset.category === "tesouro" ? "Tesouro Direto" : "Banco / Caixinha"}
                </Text>
              </View>
            </View>
            <Text style={styles.infoProductTip}>{selectedPreset.educationalTip}</Text>
          </View>
        )}

        {/* PASSO 3: RESULTADO DA PROJEÇÃO DO PRODUTO SELECIONADO */}
        <SectionLabel>3. Detalhamento do Rendimento ({selectedMonths} meses)</SectionLabel>
        <View style={styles.resultCard}>
          <View style={styles.mainResultRow}>
            <Text style={styles.mainResultLabel}>Patrimônio Líquido Acumulado</Text>
            <Text style={styles.mainResultValue}>
              {formatCurrency(projection.netTotal, currency, hideValues)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Detalhamento Financeiro */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Total Investido (Do Bolso)</Text>
              <Text style={styles.detailValue}>{formatCurrency(projection.totalInvested, currency, hideValues)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Rendimento Bruto</Text>
              <Text style={[styles.detailValue, { color: colors.jade }]}>
                +{formatCurrency(projection.grossProfit, currency, hideValues)}
              </Text>
            </View>

            {projection.b3FeeAmount > 0 && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Taxa Custódia B3 (~0,20% a.a.)</Text>
                <Text style={[styles.detailValue, { color: colors.rust }]}>
                  -{formatCurrency(projection.b3FeeAmount, currency, hideValues)}
                </Text>
              </View>
            )}

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Imposto de Renda ({projection.irPercentageText})</Text>
              <Text style={[styles.detailValue, { color: projection.irTaxAmount > 0 ? colors.rust : colors.paperDim }]}>
                {projection.irTaxAmount > 0 ? `-${formatCurrency(projection.irTaxAmount, currency, hideValues)}` : "Isento"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.jade, fontFamily: fonts.monoSemiBold }]}>
                Lucro Líquido Real
              </Text>
              <Text style={[styles.detailValue, { color: colors.jade, fontFamily: fonts.monoSemiBold }]}>
                +{formatCurrency(projection.netProfit, currency, hideValues)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Produto Selecionado</Text>
              <Text style={styles.detailValue}>{selectedPreset.name}</Text>
            </View>
          </View>
        </View>

        {/* COMPARATIVO RANQUEADO */}
        <SectionLabel>Comparativo Ranqueado para {selectedMonths} meses</SectionLabel>
        <View style={styles.compareCard}>
          <View style={styles.compareHeader}>
            <Layers size={16} color={colors.brass} />
            <Text style={styles.compareTitle}>Ranking de Retorno Líquido</Text>
          </View>

          <View style={styles.compareList}>
            {recommendation.rankedList.slice(0, 5).map(({ preset: itemPreset, proj: itemProj }, idx) => {
              const isSelected = itemPreset.id === selectedPresetId;
              const isTopRanked = idx === 0;
              return (
                <TouchableOpacity
                  key={itemPreset.id}
                  style={[styles.compareRow, isSelected && styles.compareRowHighlight]}
                  onPress={() => setSelectedPresetId(itemPreset.id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.compareTitleLine}>
                      <Text style={styles.compareName}>{itemPreset.name}</Text>
                      {isTopRanked && (
                        <View style={styles.topRankBadge}>
                          <Text style={styles.topRankBadgeText}>#1 Maior Retorno</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.compareSub}>
                      Lucro Líquido: {formatCurrency(itemProj.netProfit, currency, hideValues)}
                    </Text>
                  </View>
                  <Text style={styles.compareTotal} numberOfLines={1} adjustsFontSizeToFit>
                    {formatCurrency(itemProj.netTotal, currency, hideValues)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dica Didática */}
          <View style={styles.tipBox}>
            <Info size={14} color={colors.brass} />
            <Text style={styles.tipText}>
              Investindo na opção recomendada (
              <Text style={{ color: colors.brass, fontFamily: fonts.monoSemiBold }}>
                {recommendation.recPreset.name}
              </Text>
              ), você acumula{" "}
              <Text style={{ color: colors.jade, fontFamily: fonts.monoSemiBold }}>
                {formatCurrency(recommendation.recProj.netProfit, currency, hideValues)}
              </Text>{" "}
              em juros líquidos.
            </Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 110,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: 16,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.paper,
  },
  subtitle: {
    fontSize: 12,
    color: colors.paperDim,
    marginTop: 4,
  },
  rateBanner: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rateTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  rateTitle: {
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
    flex: 1,
    flexShrink: 1,
  },
  refreshBtn: {
    padding: 4,
  },
  rateGrid: {
    flexDirection: "row",
    gap: 8,
  },
  rateCard: {
    flex: 1,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  rateLabel: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.paperDim,
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
    color: colors.brass,
  },
  inputCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  goalSection: {
    gap: 6,
  },
  goalToggleGroup: {
    flexDirection: "row",
    backgroundColor: colors.panel2,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.line,
  },
  goalToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  goalToggleBtnActive: {
    backgroundColor: colors.brassSoft,
    borderWidth: 1,
    borderColor: colors.brass,
  },
  goalToggleText: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.paperDim,
    textAlign: "center",
  },
  goalToggleTextActive: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  field: {
    gap: 4,
  },
  monthlyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
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
  useFreeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brassSoft,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  useFreeText: {
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
    color: colors.brass,
  },
  periodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  periodBtn: {
    flex: 1,
    minWidth: 80,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  periodBtnSelected: {
    backgroundColor: colors.brassSoft,
    borderColor: colors.brass,
  },
  periodText: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  periodTextSelected: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  customPeriodBox: {
    marginTop: 10,
    gap: 8,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 10,
    padding: 12,
  },
  customPeriodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customInput: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 14,
    width: 90,
  },
  unitToggleGroup: {
    flexDirection: "row",
    backgroundColor: colors.panel,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.line,
    flex: 1,
  },
  unitToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  unitToggleBtnActive: {
    backgroundColor: colors.brassSoft,
    borderColor: colors.brass,
    borderWidth: 1,
  },
  unitToggleText: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  unitToggleTextActive: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  customPeriodText: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.brass,
  },
  recommendationCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  recHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recBadgeTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recTitleText: {
    fontSize: 13,
    fontFamily: fonts.monoSemiBold,
    color: colors.brass,
  },
  applyRecBtnFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  applyRecBtnFullText: {
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
    color: colors.ink,
  },
  recBody: {
    gap: 4,
  },
  recName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.paper,
  },
  recReason: {
    fontSize: 12,
    color: colors.paperDim,
    lineHeight: 18,
  },
  recMetricsRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.panel2,
    borderRadius: 10,
    padding: 10,
  },
  recMetricItem: {
    flex: 1,
  },
  recMetricLabel: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  recMetricValue: {
    fontSize: 14,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterBtnActive: {
    backgroundColor: colors.brassSoft,
    borderColor: colors.brass,
  },
  filterText: {
    fontSize: 11,
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  filterTextActive: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  presetList: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    paddingVertical: 2,
  },
  presetCard: {
    width: 175,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  presetCardSelected: {
    borderColor: colors.brass,
    backgroundColor: colors.brassSoft,
  },
  presetCardRecommendedBorder: {
    borderColor: colors.jade,
  },
  presetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  objectiveBadge: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  objectiveText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.brass,
  },
  recommendedPill: {
    backgroundColor: colors.jadeSoft,
    borderWidth: 1,
    borderColor: colors.jade,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  recommendedPillText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.jade,
    fontWeight: "600",
  },
  taxFreeBadge: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  taxFreeText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.paperDim,
  },
  presetName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.paper,
  },
  presetNameSelected: {
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  presetSub: {
    fontSize: 10,
    color: colors.paperDim,
    lineHeight: 14,
  },
  infoProductCard: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    gap: 6,
  },
  infoProductHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  infoProductTitle: {
    fontSize: 13,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
    flex: 1,
    flexShrink: 1,
  },
  categoryBadgeTag: {
    backgroundColor: colors.brassSoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeTagText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.brass,
  },
  infoProductTip: {
    fontSize: 11,
    color: colors.paperDim,
    lineHeight: 16,
  },
  resultCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 14,
  },
  mainResultRow: {
    gap: 4,
  },
  mainResultLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
  },
  mainResultValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.brass,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.paperDim,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
    textAlign: "right",
    flex: 1,
    flexShrink: 1,
  },
  compareCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  compareHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compareTitle: {
    fontSize: 14,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
  },
  compareList: {
    gap: 8,
  },
  compareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  compareRowHighlight: {
    borderColor: colors.brass,
    backgroundColor: colors.brassSoft,
  },
  compareTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  compareName: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.paper,
    flexShrink: 1,
  },
  topRankBadge: {
    backgroundColor: colors.jadeSoft,
    borderWidth: 1,
    borderColor: colors.jade,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  topRankBadgeText: {
    fontSize: 9,
    fontFamily: fonts.mono,
    color: colors.jade,
  },
  compareSub: {
    fontSize: 10,
    color: colors.paperDim,
    marginTop: 2,
  },
  compareTotal: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 14,
    color: colors.paper,
    textAlign: "right",
    flexShrink: 0,
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.panel2,
    borderRadius: 8,
    padding: 10,
  },
  tipText: {
    fontSize: 11,
    color: colors.paperDim,
    lineHeight: 16,
    flex: 1,
  },
});
