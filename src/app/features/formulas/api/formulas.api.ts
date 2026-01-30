import { httpClient } from "@/lib/http/axios";
import type {
  FormulaProducaoRead,
  FormulaProducaoCreate,
  FormulaProducaoUpdate,
} from "../types";

// API de registros de fórmula: cada registro = UM ingrediente de UM produto de produção (estoque_producao).
export const formulasApi = {
  listAll: (params?: { skip?: number; limit?: number }) =>
    httpClient.get<FormulaProducaoRead[]>("/formulas-producao/", { params }),

  /** Lista fórmulas por produto de produção (estoque_producao). */
  getByProduto: (idEstoqueProducao: string) =>
    httpClient.get<FormulaProducaoRead[]>(`/formulas-producao/producao/${idEstoqueProducao}`),

  getById: (id: string) =>
    httpClient.get<FormulaProducaoRead>(`/formulas-producao/${id}`),

  /** Cria UM registro (um ingrediente). Para uma receita completa, chamar várias vezes. */
  create: (data: FormulaProducaoCreate) =>
    httpClient.post<FormulaProducaoRead>("/formulas-producao/", data),

  update: (id: string, data: FormulaProducaoUpdate) =>
    httpClient.put<FormulaProducaoRead>(`/formulas-producao/${id}`, data),

  delete: (id: string) =>
    httpClient.delete<void>(`/formulas-producao/${id}`),
};