import { httpClient } from "@/lib/http/axios";
import type { MovimentacaoEstoqueCreate, MovimentacaoEstoqueRead } from "../types";

export const movimentacoesApi = {
  create: (data: MovimentacaoEstoqueCreate) =>
    httpClient.post("/movimentacoes-estoque/", data),
  listByEmpresa: (idEmpresa: string, params?: { skip?: number; limit?: number }) =>
    httpClient.get<MovimentacaoEstoqueRead[]>(`/movimentacoes-estoque/empresa/${idEmpresa}`, { params }),
};
