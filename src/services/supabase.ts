import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUPABASE_URL as ENV_URL, SUPABASE_ANON_KEY as ENV_KEY } from "@env";

export const SUPABASE_URL = ENV_URL || "";
export const SUPABASE_ANON_KEY = ENV_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
