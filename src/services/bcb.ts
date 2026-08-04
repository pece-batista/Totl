/**
 * Serviço de Integração com a API Oficial do Banco Central do Brasil (BCB SGS)
 * https://dadosabertos.bcb.gov.br/
 */

export type BcbRates = {
  selicRate: number; // Taxa Selic / CDI anual % (ex: 10.50)
  poupancaRate: number; // Taxa estimada da poupança anual % (ex: 6.17 + TR)
  ipcaRate: number; // Inflação média acumulada % (ex: 4.00)
  lastUpdated: string; // Data da última atualização
  isFallback: boolean; // Indica se usou valor salvo/fallback offline
};

const DEFAULT_RATES: BcbRates = {
  selicRate: 10.5,
  poupancaRate: 6.17,
  ipcaRate: 4.0,
  lastUpdated: "Atualizado recentemente",
  isFallback: true,
};

/**
 * Busca a Taxa Selic meta mais recente na API do Banco Central do Brasil (Série 432)
 */
export async function fetchBcbRates(): Promise<BcbRates> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json",
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return DEFAULT_RATES;
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0 && data[0]?.valor) {
      const parsedSelic = parseFloat(data[0].valor);
      if (!isNaN(parsedSelic) && parsedSelic > 0) {
        // Regra da Poupança: se Selic > 8.5% a.a., poupança é 0.5% ao mês (6.17% a.a.) + TR.
        // Se Selic <= 8.5% a.a., poupança é 70% da Selic.
        const poupanca = parsedSelic > 8.5 ? 6.17 : parsedSelic * 0.7;

        return {
          selicRate: parsedSelic,
          poupancaRate: Math.round(poupanca * 100) / 100,
          ipcaRate: 4.0,
          lastUpdated: data[0].data || "Hoje",
          isFallback: false,
        };
      }
    }
    return DEFAULT_RATES;
  } catch {
    // Caso esteja sem conexão ou ocorra timeout, retorna fallback resiliente
    return DEFAULT_RATES;
  }
}
