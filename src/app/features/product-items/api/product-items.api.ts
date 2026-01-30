import { httpClient } from "@/lib/http/axios";
import type {
  ItemEstoqueProduto,
  ItemEstoqueProdutoCreate,
  ItemEstoqueProdutoUpdate,
  ItemEstoqueProducao,
  ItemEstoqueProducaoCreate,
  ItemEstoqueProducaoUpdate,
  ItemEstoqueInsumo,
  ItemEstoqueInsumoCreate,
  ItemEstoqueInsumoUpdate,
} from "../types";

export const productItemsApi = {
  // ItemEstoqueProduto (lotes do produto - /item-estoque-produtos)
  listByEstoqueProduto: (idEstoqueProduto: string) =>
    httpClient.get<ItemEstoqueProduto[]>(
      `/item-estoque-produtos/estoque/${idEstoqueProduto}`
    ),
  getById: (id: string) =>
    httpClient.get<ItemEstoqueProduto>(`/item-estoque-produtos/${id}`),
  create: (data: ItemEstoqueProdutoCreate) =>
    httpClient.post<ItemEstoqueProduto>("/item-estoque-produtos/", data),
  update: (id: string, data: ItemEstoqueProdutoUpdate) =>
    httpClient.put<ItemEstoqueProduto>(`/item-estoque-produtos/${id}`, data),
  delete: (id: string) =>
    httpClient.delete(`/item-estoque-produtos/${id}`),

  // ItemEstoqueProducao (lotes de produção - /item-estoque-producoes)
  listByEstoqueProducao: (idEstoqueProducao: string) =>
    httpClient.get<ItemEstoqueProducao[]>(
      `/item-estoque-producoes/estoque/${idEstoqueProducao}`
    ),
  getProducaoById: (id: string) =>
    httpClient.get<ItemEstoqueProducao>(`/item-estoque-producoes/${id}`),
  createProducao: (data: ItemEstoqueProducaoCreate) =>
    httpClient.post<ItemEstoqueProducao>("/item-estoque-producoes/", data),
  updateProducao: (id: string, data: ItemEstoqueProducaoUpdate) =>
    httpClient.put<ItemEstoqueProducao>(`/item-estoque-producoes/${id}`, data),
  deleteProducao: (id: string) =>
    httpClient.delete(`/item-estoque-producoes/${id}`),
  listByEstoqueInsumo: (idEstoqueInsumo: string) =>
    httpClient.get<ItemEstoqueInsumo[]>(
      `/item-estoque-insumos/estoque/${idEstoqueInsumo}`
    ),
  getInsumoById: (id: string) =>
    httpClient.get<ItemEstoqueInsumo>(`/item-estoque-insumos/${id}`),
  createInsumo: (data: ItemEstoqueInsumoCreate) =>
    httpClient.post<ItemEstoqueInsumo>("/item-estoque-insumos/", data),
  updateInsumo: (id: string, data: ItemEstoqueInsumoUpdate) =>
    httpClient.put<ItemEstoqueInsumo>(`/item-estoque-insumos/${id}`, data),
  deleteInsumo: (id: string) =>
    httpClient.delete(`/item-estoque-insumos/${id}`),
};
