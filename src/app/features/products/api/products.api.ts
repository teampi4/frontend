import { httpClient } from "@/lib/http/axios";
import type {
  EstoqueProduto,
  EstoqueProdutoCreate,
  EstoqueProdutoUpdate,
} from "../types";

export const productsApi = {
  listByEmpresa: (idEmpresa: string) =>
    httpClient.get<EstoqueProduto[]>(`/estoque-produtos/empresa/${idEmpresa}`),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<EstoqueProduto[]>("/estoque-produtos/", { params }),
  listAtivos: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<EstoqueProduto[]>("/estoque-produtos/ativos", { params }),
  create: (data: EstoqueProdutoCreate) =>
    httpClient.post<EstoqueProduto>("/estoque-produtos/", data),
  getById: (id: string) => httpClient.get<EstoqueProduto>(`/estoque-produtos/${id}`),
  update: (id: string, data: EstoqueProdutoUpdate) =>
    httpClient.put<EstoqueProduto>(`/estoque-produtos/${id}`, data),
  delete: (id: string) => httpClient.delete(`/estoque-produtos/${id}`),
  search: (idEmpresa: string, query: string) =>
    httpClient.get<EstoqueProduto[]>("/estoque-produtos/search", {
      params: { id_empresa: idEmpresa, query },
    }),
};
