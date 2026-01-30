/** Espelho do backend: tipos de estoque e operação */
export type TipoEstoque = "insumo" | "producao" | "produto";
export type TipoOperacao = "entrada" | "saida" | "ajuste" | "transferencia";

export type MovimentacaoEstoqueRead = {
  id: string;
  id_empresa: string;
  id_usuario: string;
  tipo_estoque: TipoEstoque;
  tipo_operacao: TipoOperacao;
  quantidade: number;
  id_item_estoque_insumo?: string | null;
  id_item_estoque_producao?: string | null;
  id_item_estoque_produto?: string | null;
  motivo?: string | null;
  data_movimentacao: string;
  observacoes?: string | null;
};

export type MovimentacaoEstoqueCreate = {
  id_empresa: string;
  id_usuario: string;
  tipo_estoque: TipoEstoque;
  tipo_operacao: TipoOperacao;
  quantidade: number;
  id_item_estoque_insumo?: string | null;
  id_item_estoque_producao?: string | null;
  id_item_estoque_produto?: string | null;
  motivo?: string | null;
  observacoes?: string | null;
};
