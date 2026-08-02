import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SUPABASE_URL = "https://pxwqjvhqujlbngoaaafq.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_u7QEt2jmuJ4vWr8hzSGQJA_LZV9EThy";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
