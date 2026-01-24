import { httpClient } from "./axios";
import { toast } from "sonner";

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error("Sessão expirada. Faça login novamente.");
      window.location.assign("/auth/entrar");
    } else if (status === 403) {
      toast.error("Você não tem acesso a este recurso.");
    } else if (!status) {
      toast.error("Erro de conexão. Verifique sua internet.");
    } else {
      toast.error("Ocorreu um erro inesperado.");
    }

    return Promise.reject(error);
  },
);
