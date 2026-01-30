import { httpClient } from "@/lib/http/axios";
import type {
  ClienteResumo,
  FormaPagamentoResumo,
  Venda,
  VendaCreate,
  VendaUpdate,
} from "../types";

export const salesApi = {
  listByEmpresa: (idEmpresa: string, params?: { skip?: number; limit?: number }) =>
    httpClient.get<Venda[]>(`/vendas/empresa/${idEmpresa}`, { params }),
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<Venda[]>("/vendas/", { params }),
  getById: (id: string) => httpClient.get<Venda>(`/vendas/${id}`),
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
