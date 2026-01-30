import { httpClient } from "@/lib/http/axios";
import type {
  ClienteResumo,
  FormaPagamentoResumo,
  Venda,
  VendaCreate,
  VendaUpdate,
  VendaWithItens,
  ItemVendaRead,
} from "../types";

export const salesApi = {
  listByEmpresa: (idEmpresa: string, params?: { skip?: number; limit?: number }) =>
    httpClient.get<Venda[]>(`/vendas/empresa/${idEmpresa}`, { params }),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<Venda[]>("/vendas/", { params }),
  getById: (id: string) => httpClient.get<VendaWithItens>(`/vendas/${id}`),
  create: (data: VendaCreate) =>
    httpClient.post<Venda>("/vendas/", data),
  update: (id: string, data: VendaUpdate) =>
    httpClient.put<Venda>(`/vendas/${id}`, data),
  delete: (id: string) => httpClient.delete(`/vendas/${id}`),
  getClientesByEmpresa: (idEmpresa: string) =>
    httpClient.get<ClienteResumo[]>(`/clientes/empresa/${idEmpresa}`),
  getFormasPagamentoByEmpresa: (idEmpresa: string) =>
    httpClient.get<FormaPagamentoResumo[]>(`/formas-pagamento/empresa/${idEmpresa}`),
};

export type ItemVendaCreatePayload = {
  id_venda: string;
  id_item_estoque_produto: string;
  quantidade: number;
  preco_unitario: number;
  desconto?: number;
  valor_total?: number;
  observacao?: string | null;
};

export type ItemVendaUpdatePayload = {
  quantidade?: number;
  preco_unitario?: number;
  desconto?: number;
  valor_total?: number;
  observacao?: string | null;
};

export const itemVendaApi = {
  listByVenda: (idVenda: string) =>
    httpClient.get<ItemVendaRead[]>(`/item-vendas/venda/${idVenda}`),
  getById: (id: string) => httpClient.get<ItemVendaRead>(`/item-vendas/${id}`),
  create: (data: ItemVendaCreatePayload) =>
    httpClient.post<ItemVendaRead>("/item-vendas/", {
      ...data,
      valor_total: data.valor_total ?? data.quantidade * data.preco_unitario - (data.desconto ?? 0),
    }),
  update: (id: string, data: ItemVendaUpdatePayload) =>
    httpClient.put<ItemVendaRead>(`/item-vendas/${id}`, data),
  delete: (id: string) => httpClient.delete(`/item-vendas/${id}`),
};
