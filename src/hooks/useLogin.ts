import { authApi } from "@/app/features/auth/api/auth.api";
import type { LoginPayload } from "@/app/features/auth/types";
import { httpClient } from "@/lib/http/axios";
import type { AxiosError } from "axios";
import { useState } from "react";

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  usuario: {
    id: string;
    login: string;
    nome: string;
    perfil: string;
    id_empresa: string | null;
    ativo: boolean;
    data_criacao: string;
  };
};

export async function login(values: { login: string; senha: string }) {
  const res = await httpClient.post<LoginResponse>("/auth/login", values);

  const { access_token, usuario } = res.data;
  console.log(access_token, usuario);
  

  localStorage.setItem("token", access_token);
  localStorage.setItem("usuario", JSON.stringify(usuario));

  return usuario;
}


export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: LoginPayload) {
    setLoading(true);
    setError(null);

    try {
      const res = await authApi.login(data);

      const { access_token, usuario } = res.data;
      console.log(access_token, usuario);


      localStorage.setItem("token", access_token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      return usuario;
    } catch (err: unknown) {
        const _error = err as AxiosError;
        setError(_error.message ?? "Erro ao fazer login");
        throw err;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
