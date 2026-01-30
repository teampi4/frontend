import { httpClient } from "@/lib/http/axios";
import type {
  EstoqueInsumo,
  EstoqueInsumoCreate,
  EstoqueInsumoUpdate,
} from "../types";

export const insumosApi = {
  listByEmpresa: (idEmpresa: string) =>
    httpClient.get<EstoqueInsumo[]>(`/estoque-insumos/empresa/${idEmpresa}`),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<EstoqueInsumo[]>("/estoque-insumos/", { params }),
  listAtivos: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<EstoqueInsumo[]>("/estoque-insumos/ativos", { params }),
  create: (data: EstoqueInsumoCreate) =>
    httpClient.post<EstoqueInsumo>("/estoque-insumos/", data),
  getById: (id: string) => httpClient.get<EstoqueInsumo>(`/estoque-insumos/${id}`),
  update: (id: string, data: EstoqueInsumoUpdate) =>
    httpClient.put<EstoqueInsumo>(`/estoque-insumos/${id}`, data),
  delete: (id: string) => httpClient.delete(`/estoque-insumos/${id}`),
  search: (idEmpresa: string, query: string) =>
    httpClient.get<EstoqueInsumo[]>("/estoque-insumos/search", {
      params: { id_empresa: idEmpresa, query },
    }),
};
