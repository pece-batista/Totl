import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  DollarSign,
  Tag,
  ShieldCheck,
  Info,
  LogOut,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Check,
  X,
} from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { supabase } from "../services/supabase";
import { formatCurrency, formatCurrencyInput, parseDecimal, CURRENCIES } from "../utils/currency";
import SectionLabel from "../components/SectionLabel";
import type { CurrencyCode } from "../types";

type Props = {
  salary: number;
  currency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  onSaveSalary: (val: number) => Promise<void>;
  onOpenCategoryManager: () => void;
  onSignOut: () => void;
  onClearExpenses: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
};

export default function SettingsScreen({
  salary,
  currency,
  onSelectCurrency,
  onSaveSalary,
  onOpenCategoryManager,
  onSignOut,
  onClearExpenses,
  onDeleteAccount,
}: Props) {
  const [username, setUsername] = useState<string>("Usuário");
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(formatCurrencyInput(String(Math.round(salary * 100))));
  const [savingSalary, setSavingSalary] = useState(false);

  // Currency Dropdown State
  const [currencyDropdownVisible, setCurrencyDropdownVisible] = useState(false);

  // Modais de confirmação de segurança
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const name = data.user.user_metadata?.username || data.user.email || "Usuário";
        setUsername(name);
      }
    }
    loadUser();
  }, []);

  async function handleSaveSalary() {
    const num = parseDecimal(salaryInput);
    if (isNaN(num) || num < 0) return;
    setSavingSalary(true);
    await onSaveSalary(num);
    setSavingSalary(false);
    setEditingSalary(false);
  }

  async function confirmClearExpenses() {
    setActionLoading(true);
    await onClearExpenses();
    setActionLoading(false);
    setClearModalVisible(false);
    Alert.alert("Sucesso", "Todos os lançamentos foram removidos.");
  }

  async function confirmDeleteAccount() {
    setActionLoading(true);
    await onDeleteAccount();
    setActionLoading(false);
    setDeleteAccountModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Perfil, personalização e segurança da conta</Text>
        </View>

        {/* 1. PERFIL DO USUÁRIO */}
        <SectionLabel>Perfil & Salário</SectionLabel>
        <View style={styles.card}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <User size={22} color={colors.brass} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>@{username}</Text>
              <Text style={styles.userSub}>Conta Ativa • Nuvem Supabase</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Salário Fixo Mensal</Text>
              {editingSalary ? (
                <TextInput
                  style={styles.salaryInput}
                  keyboardType="number-pad"
                  value={salaryInput}
                  onChangeText={(t) => setSalaryInput(formatCurrencyInput(t))}
                  autoFocus
                />
              ) : (
                <Text style={styles.fieldValue}>{formatCurrency(salary, currency)}</Text>
              )}
            </View>

            {editingSalary ? (
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSalary} disabled={savingSalary}>
                {savingSalary ? <ActivityIndicator size="small" color={colors.ink} /> : <Check size={16} color={colors.ink} />}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setSalaryInput(formatCurrencyInput(String(Math.round(salary * 100))));
                  setEditingSalary(true);
                }}
              >
                <Text style={styles.editBtnText}>Alterar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. PERSONALIZAÇÃO */}
        <SectionLabel>Personalização</SectionLabel>
        <TouchableOpacity style={styles.actionCard} onPress={onOpenCategoryManager} activeOpacity={0.8}>
          <View style={styles.actionIconBg}>
            <Tag size={18} color={colors.brass} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Rótulos & Categorias</Text>
            <Text style={styles.actionSub}>Criar, editar nomes e paleta de cores</Text>
          </View>
          <ChevronRight size={18} color={colors.paperDim} />
        </TouchableOpacity>

        {/* 3. PREFERÊNCIAS & SEGURANÇA */}
        <SectionLabel>Informações & Moeda</SectionLabel>
        <View style={styles.card}>
          {/* Seletor Dropdown de Moeda */}
          <TouchableOpacity
            style={styles.currencySelectRow}
            onPress={() => setCurrencyDropdownVisible(true)}
            activeOpacity={0.8}
          >
            <DollarSign size={16} color={colors.brass} />
            <Text style={styles.infoLabel}>Formato de Moeda</Text>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyBadgeText}>{CURRENCIES[currency]?.label || currency}</Text>
              <ChevronDown size={14} color={colors.brass} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ShieldCheck size={16} color={colors.jade} />
            <Text style={styles.infoLabel}>Segurança da Nuvem</Text>
            <Text style={styles.infoValue}>RLS PostgreSQL</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Info size={16} color={colors.paperDim} />
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>Totl v1.0.0</Text>
          </View>
        </View>

        {/* 4. SESSÃO & ZONA DE PERIGO */}
        <SectionLabel>Sessão & Conta</SectionLabel>

        <TouchableOpacity style={styles.signOutCard} onPress={onSignOut} activeOpacity={0.8}>
          <LogOut size={18} color={colors.paper} />
          <Text style={styles.signOutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={[styles.card, { borderColor: colors.rustSoft, marginTop: 12 }]}>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={() => setClearModalVisible(true)}
            activeOpacity={0.8}
          >
            <Trash2 size={16} color={colors.rust} />
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerTitle}>Limpar todos os lançamentos</Text>
              <Text style={styles.dangerSub}>Apaga todos os gastos cadastrados</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.dangerRow}
            onPress={() => setDeleteAccountModalVisible(true)}
            activeOpacity={0.8}
          >
            <AlertTriangle size={16} color={colors.rust} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.dangerTitle, { color: colors.rust }]}>Excluir Minha Conta</Text>
              <Text style={styles.dangerSub}>Deleta permanentemente seu perfil e dados</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Dropdown: Seleção de Moeda */}
      <Modal visible={currencyDropdownVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <DollarSign size={28} color={colors.brass} />
            <Text style={styles.modalTitle}>Escolha o Formato de Moeda</Text>
            <Text style={styles.modalSub}>
              O símbolo e a formatação numérica serão atualizados em todo o aplicativo.
            </Text>

            <View style={styles.currencyOptionsList}>
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                const item = CURRENCIES[code];
                const isSelected = currency === code;
                return (
                  <TouchableOpacity
                    key={code}
                    style={[styles.currencyOptionItem, isSelected && styles.currencyOptionSelected]}
                    onPress={() => {
                      onSelectCurrency(code);
                      setCurrencyDropdownVisible(false);
                    }}
                  >
                    <Text style={[styles.currencyOptionText, isSelected && styles.currencyOptionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && <Check size={16} color={colors.brass} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalFullCloseBtn}
              onPress={() => setCurrencyDropdownVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalFullCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmação: Limpar Lançamentos */}
      <Modal visible={clearModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Trash2 size={28} color={colors.rust} />
            <Text style={styles.modalTitle}>Limpar Todos os Lançamentos?</Text>
            <Text style={styles.modalSub}>
              Esta ação removerá permanentemente todos os gastos cadastrados no seu orçamento. Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setClearModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmClearExpenses}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.paper} />
                ) : (
                  <Text style={styles.modalConfirmText}>Sim, Limpar tudo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmação: Excluir Conta */}
      <Modal visible={deleteAccountModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: colors.rust }]}>
            <AlertTriangle size={32} color={colors.rust} />
            <Text style={[styles.modalTitle, { color: colors.rust }]}>Excluir Conta Permanentemente?</Text>
            <Text style={styles.modalSub}>
              Sua conta e todo o seu histórico financeiro no Supabase serão apagados permanentemente. Você precisará se cadastrar novamente para usar o Totl.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteAccountModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.rust }]}
                onPress={confirmDeleteAccount}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.modalConfirmText, { color: "#FFF" }]}>Excluir Conta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brassSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: 16,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
  },
  userSub: {
    fontSize: 11,
    color: colors.paperDim,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 14,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 16,
    color: colors.brass,
  },
  salaryInput: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 14,
    width: 140,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.panel2,
  },
  editBtnText: {
    fontSize: 12,
    color: colors.brass,
    fontFamily: fonts.monoSemiBold,
  },
  saveBtn: {
    backgroundColor: colors.brass,
    borderRadius: 6,
    padding: 8,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.brassSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.paper,
  },
  actionSub: {
    fontSize: 11,
    color: colors.paperDim,
    marginTop: 2,
  },
  currencySelectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  currencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brassSoft,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  currencyBadgeText: {
    fontSize: 12,
    fontFamily: fonts.monoSemiBold,
    color: colors.brass,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.paperDim,
    flex: 1,
  },
  infoValue: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.paper,
  },
  currencyOptionsList: {
    width: "100%",
    gap: 8,
    marginVertical: 10,
  },
  currencyOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  currencyOptionSelected: {
    borderColor: colors.brass,
    backgroundColor: colors.brassSoft,
  },
  currencyOptionText: {
    fontSize: 13,
    color: colors.paper,
    fontFamily: fonts.mono,
  },
  currencyOptionTextSelected: {
    color: colors.brass,
    fontWeight: "600",
  },
  modalFullCloseBtn: {
    backgroundColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    alignSelf: "center",
  },
  modalFullCloseText: {
    color: colors.ink,
    fontSize: 13,
    fontFamily: fonts.monoSemiBold,
  },
  signOutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 14,
    fontFamily: fonts.monoSemiBold,
    color: colors.paper,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  dangerTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.paper,
  },
  dangerSub: {
    fontSize: 11,
    color: colors.paperDim,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.paper,
    textAlign: "center",
  },
  modalSub: {
    fontSize: 12,
    color: colors.paperDim,
    textAlign: "center",
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: colors.paperDim,
    fontSize: 13,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.rustSoft,
    borderWidth: 1,
    borderColor: colors.rust,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalConfirmText: {
    color: colors.rust,
    fontWeight: "600",
    fontSize: 13,
  },
});
