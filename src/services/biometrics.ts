import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const rnBiometrics = new ReactNativeBiometrics();
const BIOMETRIC_ENABLED_KEY = "@totl_biometric_enabled";
const BIOMETRIC_CREDENTIALS_KEY = "@totl_biometric_credentials";

export async function checkBiometricsAvailable(): Promise<{ available: boolean; type: string }> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return {
      available: !!available,
      type:
        biometryType === BiometryTypes.Biometrics
          ? "Biometria"
          : biometryType === BiometryTypes.FaceID
          ? "Face ID"
          : "Impressão Digital",
    };
  } catch (error) {
    return { available: false, type: "" };
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

export async function setBiometricEnabled(
  enabled: boolean,
  credentials?: { username: string; pass: string }
) {
  if (enabled && credentials) {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, "true");
    await AsyncStorage.setItem(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
  } else {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await AsyncStorage.removeItem(BIOMETRIC_CREDENTIALS_KEY);
  }
}

export async function getSavedBiometricCredentials(): Promise<{ username: string; pass: string } | null> {
  const data = await AsyncStorage.getItem(BIOMETRIC_CREDENTIALS_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function promptBiometricAuth(
  promptMessage = "Confirme sua digital para entrar no Totl"
): Promise<boolean> {
  try {
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: "Cancelar",
    });
    return !!success;
  } catch (error) {
    console.error("Erro no prompt de biometria:", error);
    return false;
  }
}
