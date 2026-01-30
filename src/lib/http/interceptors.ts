import { httpClient } from "./axios";
import { toast } from "sonner";

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function getMessageFromResponse(error: { response?: { data?: unknown } }): string | null {
  const data = error.response?.data;
  if (!data || typeof data !== "object") return null;
  if (typeof (data as { detail?: unknown }).detail === "string") return (data as { detail: string }).detail;
  if (Array.isArray((data as { detail?: unknown }).detail)) {
    const arr = (data as { detail: Array<{ msg?: string }> }).detail;
    const msg = arr.map((e) => e.msg ?? JSON.stringify(e)).join("; ");
    return msg || null;
  }
  if (typeof (data as { message?: string }).message === "string") return (data as { message: string }).message;
  return null;
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = getMessageFromResponse(error);

    if (status === 401) {
      toast.error("Sessão expirada. Faça login novamente.");
      window.location.assign("/auth/entrar");
    } else if (status === 403) {
      toast.error("Você não tem acesso a este recurso.");
    } else if (!status) {
      toast.error("Erro de conexão. Verifique sua internet e se o servidor está rodando.");
    } else {
      toast.error(serverMessage || `Erro do servidor (${status}). Tente novamente.`);
    }

    return Promise.reject(error);
  },
);
