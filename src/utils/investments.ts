/**
 * Utilitários de Cálculo Financeiro e Juros Compostos para Investimentos
 * Inclui produtos bancários e todos os títulos oficiais do Tesouro Direto (Selic, IPCA+, RendA+, Educa+, Prefixado)
 */

export type CategoryType = "bank" | "tesouro";

export type PresetType =
  | "cdi100"
  | "poupanca"
  | "cdi110"
  | "lci_lca"
  | "tesouro_selic"
  | "tesouro_ipca"
  | "tesouro_renda"
  | "tesouro_educa"
  | "tesouro_prefixado"
  | "tesouro_semestral";

export type InvestmentPreset = {
  id: PresetType;
  name: string;
  subtitle: string;
  objective: string; // Ex: "Reserva de Emergência", "Aposentadoria", "Estudos"
  category: CategoryType;
  cdiPercentage?: number; // Porcentagem do CDI
  isTaxFree: boolean; // Se é isento de Imposto de Renda
  usePoupancaRate?: boolean;
  useIpcaRate?: boolean; // Se depende da inflação (IPCA)
  fixedRateOverIpca?: number; // Taxa real acima do IPCA (ex: 6.2%)
  fixedAnnualRate?: number; // Taxa pré-fixada (ex: 11.5%)
  b3FeePercent?: number; // Taxa de custódia da B3 (ex: 0.20% a.a.)
  educationalTip: string; // Explicação didática simplificada
};

export const INVESTMENT_PRESETS: InvestmentPreset[] = [
  // --- BANCOS & CAIXINHAS ---
  {
    id: "cdi100",
    name: "Caixinha / 100% CDI",
    subtitle: "Nubank, PicPay, Mercado Pago, Itaú",
    objective: "Reserva & Curto Prazo",
    category: "bank",
    cdiPercentage: 100,
    isTaxFree: false,
    educationalTip: "Excelente para guardar dinheiro do dia a dia com liquidez diária e rendimento superior à poupança.",
  },
  {
    id: "poupanca",
    name: "Poupança Tradicional",
    subtitle: "Bancos Tradicionais (Isento de IR)",
    objective: "Liquidez Imediata",
    category: "bank",
    cdiPercentage: 0,
    isTaxFree: true,
    usePoupancaRate: true,
    educationalTip: "Isento de IR, porém rende consideravelmente menos do que o CDI e o Tesouro Direto.",
  },
  {
    id: "cdi110",
    name: "CDB Turbo (110% CDI)",
    subtitle: "Bancos digitais e promoções",
    objective: "Reserva com Maior Rendimento",
    category: "bank",
    cdiPercentage: 110,
    isTaxFree: false,
    educationalTip: "Oferecido por bancos em promoções. Rende 10% a mais que a taxa CDI padrão.",
  },
  {
    id: "lci_lca",
    name: "LCI / LCA (90% CDI)",
    subtitle: "Renda Fixa Isenta de Imposto de Renda",
    objective: "Médio Prazo sem Imposto",
    category: "bank",
    cdiPercentage: 90,
    isTaxFree: true,
    educationalTip: "Letras de Crédito Imobiliário/Agronegócio. Não pagam Imposto de Renda.",
  },

  // --- TESOURO DIRETO ---
  {
    id: "tesouro_selic",
    name: "Tesouro SELIC",
    subtitle: "O mais seguro para Reserva de Emergência",
    objective: "Reserva de Emergência",
    category: "tesouro",
    isTaxFree: false,
    b3FeePercent: 0.2,
    educationalTip: "Título mais seguro do Brasil. Pode resgatar quando quiser sem perder rendimento.",
  },
  {
    id: "tesouro_renda",
    name: "Tesouro RendA+ (Aposentadoria)",
    subtitle: "Planejamento de Aposentadoria Extra",
    objective: "Aposentadoria & Futuro",
    category: "tesouro",
    isTaxFree: false,
    useIpcaRate: true,
    fixedRateOverIpca: 6.3,
    b3FeePercent: 0.1,
    educationalTip: "Você acumula durante anos e depois recebe 240 parcelas mensais (20 anos) corrigidas pela inflação!",
  },
  {
    id: "tesouro_educa",
    name: "Tesouro Educa+ (Faculdade / Estudos)",
    subtitle: "Custeio de Estudos dos Filhos / Universidade",
    objective: "Estudos & Faculdade",
    category: "tesouro",
    isTaxFree: false,
    useIpcaRate: true,
    fixedRateOverIpca: 6.1,
    b3FeePercent: 0.1,
    educationalTip: "Guardando hoje, garante 60 parcelas mensais (5 anos de universidade) para pagar os estudos no futuro.",
  },
  {
    id: "tesouro_ipca",
    name: "Tesouro IPCA+",
    subtitle: "Proteção contra Inflação no Longo Prazo",
    objective: "Longo Prazo & Grandes Sonhos",
    category: "tesouro",
    isTaxFree: false,
    useIpcaRate: true,
    fixedRateOverIpca: 6.2,
    b3FeePercent: 0.2,
    educationalTip: "Garante ganho real acima da inflação. Protege 100% do seu poder de compra para comprar casa, carro ou viajar.",
  },
  {
    id: "tesouro_prefixado",
    name: "Tesouro Prefixado",
    subtitle: "Taxa Fixa Garantida até o Vencimento",
    objective: "Médio Prazo com Taxa Garantida",
    category: "tesouro",
    isTaxFree: false,
    fixedAnnualRate: 11.5,
    b3FeePercent: 0.2,
    educationalTip: "Você sabe exatamente o valor em reais que vai receber no vencimento, independente do mercado.",
  },
  {
    id: "tesouro_semestral",
    name: "Tesouro IPCA+ com Juros Semestrais",
    subtitle: "Renda Passiva paga a cada 6 meses",
    objective: "Renda Passiva Recorrente",
    category: "tesouro",
    isTaxFree: false,
    useIpcaRate: true,
    fixedRateOverIpca: 6.15,
    b3FeePercent: 0.2,
    educationalTip: "Paga os cupons de juros diretamente na sua conta bancária a cada 6 meses.",
  },
];

/**
 * Retorna a alíquota de Imposto de Renda (IR) Regressivo de Renda Fixa conforme o tempo em meses
 */
export function getIncomeTaxRate(months: number): number {
  if (months <= 6) return 0.225; // 22,5% até 6 meses
  if (months <= 12) return 0.2; // 20,0% de 7 a 12 meses
  if (months <= 24) return 0.175; // 17,5% de 13 a 24 meses
  return 0.15; // 15,0% acima de 24 meses
}

export type SimulationResult = {
  totalInvested: number; // Quanto o usuário colocou do bolso
  grossTotal: number; // Total acumulado bruto
  grossProfit: number; // Lucro bruto (juros ganhos)
  b3FeeAmount: number; // Taxa B3 de custódia (se houver)
  irTaxAmount: number; // Valor retido de IR
  netTotal: number; // Valor líquido final no bolso
  netProfit: number; // Lucro líquido final no bolso
  irPercentageText: string;
};

/**
 * Calcula a projeção de juros compostos com aportes mensais para Bancos e Tesouro Direto
 */
export function calculateInvestmentProjection(
  initialAmount: number,
  monthlyContribution: number,
  months: number,
  selicRateAnnual: number,
  poupancaRateAnnual: number,
  preset: InvestmentPreset
): SimulationResult {
  const safeInitial = Math.max(0, initialAmount || 0);
  const safeMonthly = Math.max(0, monthlyContribution || 0);
  const safeMonths = Math.max(1, months || 1);

  // 1. Determina a taxa de juros anual bruta efetiva
  let effectiveAnnualRate = selicRateAnnual;

  if (preset.usePoupancaRate) {
    effectiveAnnualRate = poupancaRateAnnual;
  } else if (preset.fixedAnnualRate) {
    effectiveAnnualRate = preset.fixedAnnualRate;
  } else if (preset.useIpcaRate) {
    const ipca = 4.0; // Inflação média IPCA
    const realRate = preset.fixedRateOverIpca || 6.2;
    // Fórmula oficial de juros reais compostos: (1 + IPCA) * (1 + TaxaReal) - 1
    effectiveAnnualRate = (1 + ipca / 100) * (1 + realRate / 100) * 100 - 100;
  } else if (preset.cdiPercentage !== undefined) {
    effectiveAnnualRate = (selicRateAnnual * preset.cdiPercentage) / 100;
  }

  // Desconta taxa de custódia da B3 se houver (ex: 0.20% a.a. ou 0.10% a.a.)
  const b3Rate = preset.b3FeePercent || 0;
  const netAnnualRate = Math.max(0, effectiveAnnualRate - b3Rate);

  // 2. Converte a taxa anual em taxa mensal equivalente
  const monthlyRate = Math.pow(1 + netAnnualRate / 100, 1 / 12) - 1;

  // 3. Simula mês a mês a bola de neve de juros compostos
  let currentBalance = safeInitial;
  let totalDeposited = safeInitial;

  for (let m = 1; m <= safeMonths; m++) {
    currentBalance += currentBalance * monthlyRate;
    currentBalance += safeMonthly;
    totalDeposited += safeMonthly;
  }

  const grossTotal = currentBalance;
  const grossProfit = Math.max(0, grossTotal - totalDeposited);

  // Taxa B3 aproximada acumulada no período
  const b3FeeAmount = b3Rate > 0 ? (grossTotal * (b3Rate / 100) * (safeMonths / 12)) : 0;

  // 4. Calcula Imposto de Renda
  let irTaxAmount = 0;
  let irPercentageText = "Isento";

  if (!preset.isTaxFree && grossProfit > 0) {
    const taxRate = getIncomeTaxRate(safeMonths);
    irTaxAmount = grossProfit * taxRate;
    irPercentageText = `${(taxRate * 100).toFixed(1).replace(".", ",")}%`;
  }

  const netTotal = grossTotal - irTaxAmount;
  const netProfit = Math.max(0, netTotal - totalDeposited);

  return {
    totalInvested: Math.round(totalDeposited * 100) / 100,
    grossTotal: Math.round(grossTotal * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    b3FeeAmount: Math.round(b3FeeAmount * 100) / 100,
    irTaxAmount: Math.round(irTaxAmount * 100) / 100,
    netTotal: Math.round(netTotal * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    irPercentageText,
  };
}
