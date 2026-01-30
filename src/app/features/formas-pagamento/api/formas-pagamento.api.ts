import { httpClient } from "@/lib/http/axios";
import type { FormaPagamento, FormaPagamentoCreate, FormaPagamentoUpdate } from "../types";

export const formasPagamentoApi = {
  listByEmpresa: (idEmpresa: string) =>
    httpClient.get<FormaPagamento[]>(`/formas-pagamento/empresa/${idEmpresa}`),
  listByEmpresaAll: (idEmpresa: string) =>
    httpClient.get<FormaPagamento[]>(`/formas-pagamento/empresa/${idEmpresa}/todas`),
  getById: (id: string) => httpClient.get<FormaPagamento>(`/formas-pagamento/${id}`),
  create: (data: FormaPagamentoCreate) =>
    httpClient.post<FormaPagamento>("/formas-pagamento/", data),
  update: (id: string, data: FormaPagamentoUpdate) =>
    httpClient.put<FormaPagamento>(`/formas-pagamento/${id}`, data),
  delete: (id: string) => httpClient.delete(`/formas-pagamento/${id}`),
};
