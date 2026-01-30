import { httpClient } from "@/lib/http/axios";
import type {
  EstoqueProducao,
  EstoqueProducaoCreate,
  EstoqueProducaoUpdate,
} from "../types";

export const producaoApi = {
  listByEmpresa: (idEmpresa: string) =>
    httpClient.get<EstoqueProducao[]>(`/estoque-producoes/empresa/${idEmpresa}`),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<EstoqueProducao[]>("/estoque-producoes/", { params }),
  listAtivos: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<EstoqueProducao[]>("/estoque-producoes/ativos", { params }),
  create: (data: EstoqueProducaoCreate) =>
    httpClient.post<EstoqueProducao>("/estoque-producoes/", data),
  getById: (id: string) => httpClient.get<EstoqueProducao>(`/estoque-producoes/${id}`),
  update: (id: string, data: EstoqueProducaoUpdate) =>
    httpClient.put<EstoqueProducao>(`/estoque-producoes/${id}`, data),
  delete: (id: string) => httpClient.delete(`/estoque-producoes/${id}`),
};
