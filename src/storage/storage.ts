import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Expense } from "../types";

const SETTINGS_KEY = "@budget/settings";
const EXPENSES_KEY = "@budget/expenses";

export async function getSalary(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return typeof parsed.salary === "number" ? parsed.salary : 0;
  } catch {
    return 0;
  }
}

export async function setSalary(value: number): Promise<boolean> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ salary: value }));
    return true;
  } catch {
    return false;
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const raw = await AsyncStorage.getItem(EXPENSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setExpenses(list: Expense[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}
