import { httpClient } from "@/lib/http/axios";
import type { Usuario, UsuarioCreate, UsuarioUpdate } from "../types";

export const usuariosApi = {
  listByEmpresa: (idEmpresa: string, params?: { skip?: number; limit?: number }) =>
    httpClient.get<Usuario[]>(`/usuarios/empresa/${idEmpresa}`, { params }),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<Usuario[]>("/usuarios/", { params }),
  listAtivos: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<Usuario[]>("/usuarios/ativos", { params }),
  getById: (id: string) => httpClient.get<Usuario>(`/usuarios/${id}`),
  create: (data: UsuarioCreate) => httpClient.post<Usuario>("/usuarios/", data),
  update: (id: string, data: UsuarioUpdate) =>
    httpClient.put<Usuario>(`/usuarios/${id}`, data),
  delete: (id: string) => httpClient.delete(`/usuarios/${id}`),
};
