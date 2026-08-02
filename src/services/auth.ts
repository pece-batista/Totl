import { supabase } from "./supabase";

export const formatUsernameEmail = (username: string): string => {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  return `${clean}@totl.app`;
};

export async function checkUsernameExists(username: string): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();
  const { data, error } = await supabase.rpc("check_username_exists", {
    p_username: cleanUsername,
  });

  if (error) {
    console.error("Erro ao verificar username via RPC:", error);
    return false;
  }
  return !!data;
}

export async function signUpUser(fullName: string, username: string, password: string) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanFullName = fullName.trim();

  if (!cleanFullName) {
    throw new Error("Por favor, informe seu nome.");
  }
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error("O nome de usuário deve ter pelo menos 3 caracteres.");
  }
  if (!password || password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  // 1. Verifica se o username já existe no banco
  const exists = await checkUsernameExists(cleanUsername);
  if (exists) {
    throw new Error("Este login já está em uso. Escolha outro.");
  }

  const email = formatUsernameEmail(cleanUsername);

  // 2. Cadastra no Auth do Supabase (A Trigger handle_new_user do Postgres criará a linha em profiles automaticamente)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: cleanFullName,
        username: cleanUsername,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      throw new Error("Este login já está em uso. Escolha outro.");
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Não foi possível criar a conta. Tente novamente.");
  }

  return data;
}

export async function signInUser(username: string, password: string) {
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanUsername) {
    throw new Error("Por favor, informe seu login.");
  }
  if (!password) {
    throw new Error("Por favor, informe sua senha.");
  }

  const email = formatUsernameEmail(cleanUsername);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Login ou senha incorretos.");
    }
    throw new Error(error.message);
  }

  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
