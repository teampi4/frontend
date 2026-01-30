import { httpClient } from "@/lib/http/axios";
import type { Cliente, ClienteCreate, ClienteUpdate } from "../types";

export const clientesApi = {
  listByEmpresa: (idEmpresa: string, params?: { skip?: number; limit?: number }) =>
    httpClient.get<Cliente[]>(`/clientes/empresa/${idEmpresa}`, { params }),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<Cliente[]>("/clientes/", { params }),
  listAtivos: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<Cliente[]>("/clientes/ativos", { params }),
  search: (idEmpresa: string, query: string) =>
    httpClient.get<Cliente[]>("/clientes/search", { params: { id_empresa: idEmpresa, query } }),
  getById: (id: string) => httpClient.get<Cliente>(`/clientes/${id}`),
  create: (data: ClienteCreate) => httpClient.post<Cliente>("/clientes/", data),
  update: (id: string, data: ClienteUpdate) =>
    httpClient.put<Cliente>(`/clientes/${id}`, data),
  delete: (id: string) => httpClient.delete(`/clientes/${id}`),
};
