import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, Fingerprint } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import { signInUser, signUpUser } from "../services/auth";
import {
  checkBiometricsAvailable,
  isBiometricEnabled,
  getSavedBiometricCredentials,
  promptBiometricAuth,
  setBiometricEnabled,
} from "../services/biometrics";

type Mode = "login" | "signup";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasBiometricBtn, setHasBiometricBtn] = useState(false);

  useEffect(() => {
    async function initBiometrics() {
      const { available } = await checkBiometricsAvailable();
      const enabled = await isBiometricEnabled();
      const credentials = await getSavedBiometricCredentials();
      if (available && enabled && credentials) {
        setHasBiometricBtn(true);
      }
    }
    initBiometrics();
  }, []);

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setErrorMsg("");
  }

  async function handleBiometricLogin() {
    setErrorMsg("");
    const credentials = await getSavedBiometricCredentials();
    if (!credentials) {
      setErrorMsg("Nenhuma credencial gravada para biometria.");
      return;
    }

    const authenticated = await promptBiometricAuth("Confirme sua digital para entrar no Totl");
    if (authenticated) {
      setLoading(true);
      try {
        await signInUser(credentials.username, credentials.pass);
      } catch (err: any) {
        setErrorMsg(err.message || "Erro ao entrar via biometria.");
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleSubmit() {
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signInUser(username, password);
        const { available } = await checkBiometricsAvailable();
        if (available) {
          await setBiometricEnabled(true, { username, pass: password });
        }
      } else {
        await signUpUser(fullName, username, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>Totl</Text>
            <Text style={styles.brandSubtitle}>Controle de orçamento mensal</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, mode === "login" && styles.tabActive]}
                onPress={() => switchMode("login")}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                  Entrar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === "signup" && styles.tabActive]}
                onPress={() => switchMode("signup")}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>
                  Criar Conta
                </Text>
              </TouchableOpacity>
            </View>

            {!!errorMsg && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {mode === "signup" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME COMPLETO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Paulo César"
                  placeholderTextColor={colors.paperDim}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LOGIN (NOME DE USUÁRIO)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: pcbatista"
                placeholderTextColor={colors.paperDim}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SENHA</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Sua senha secreta"
                  placeholderTextColor={colors.paperDim}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.paperDim} />
                  ) : (
                    <Eye size={18} color={colors.paperDim} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, mode === "signup" ? styles.buttonSignup : styles.buttonLogin]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === "login" ? "ENTRAR NO TOTL" : "CRIAR MINHA CONTA"}
                </Text>
              )}
            </TouchableOpacity>

            {mode === "login" && hasBiometricBtn && (
              <TouchableOpacity
                style={styles.biometricBtn}
                onPress={handleBiometricLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Fingerprint size={20} color={colors.brass} />
                <Text style={styles.biometricBtnText}>Entrar com Biometria</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.footerToggle}
              onPress={() => switchMode(mode === "login" ? "signup" : "login")}
            >
              <Text style={styles.footerToggleText}>
                {mode === "login"
                  ? "Não tem uma conta ainda? Clique aqui para criar"
                  : "Já tem uma conta? Clique aqui para entrar"}
              </Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  brandTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    color: colors.brass,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.paperDim,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.ink,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.panel2,
  },
  tabText: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.paperDim,
  },
  tabTextActive: {
    color: colors.brass,
  },
  errorBanner: {
    backgroundColor: colors.rustSoft,
    borderWidth: 1,
    borderColor: colors.rust,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: fonts.mono,
    color: colors.rust,
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 11,
    color: colors.paperDim,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 14,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  buttonLogin: {
    backgroundColor: colors.jade,
  },
  buttonSignup: {
    backgroundColor: colors.brass,
  },
  buttonText: {
    fontFamily: fonts.monoSemiBold,
    color: colors.ink,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  biometricBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brassSoft,
    borderWidth: 1,
    borderColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  biometricBtnText: {
    fontFamily: fonts.monoSemiBold,
    color: colors.brass,
    fontSize: 13,
  },
  footerToggle: {
    alignItems: "center",
  },
  footerToggleText: {
    fontFamily: fonts.mono,
    color: colors.paperDim,
    fontSize: 12,
    textAlign: "center",
  },
});
