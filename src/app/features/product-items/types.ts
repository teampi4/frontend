export type ItemEstoqueProduto = {
  id: string;
  id_estoque_produto: string;
  lote: string;
  data_producao: string;
  data_validade?: string | null;
  quantidade: number;
  quantidade_reservada: number;
  quantidade_minima: number;
  custo_unitario: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueProdutoCreate = {
  id_estoque_produto: string;
  lote: string;
  data_producao: string;
  data_validade?: string | null;
  quantidade: number;
  custo_unitario: number;
  quantidade_reservada?: number;
  quantidade_minima?: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueProdutoUpdate = {
  lote?: string;
  data_producao?: string;
  data_validade?: string | null;
  quantidade?: number;
  quantidade_reservada?: number;
  quantidade_minima?: number;
  custo_unitario?: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueProducao = {
  id: string;
  id_estoque_producao: string;
  lote: string;
  data_producao: string;
  data_validade?: string | null;
  quantidade: number;
  quantidade_minima: number;
  custo_unitario: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueProducaoCreate = {
  id_estoque_producao: string;
  lote: string;
  data_producao: string;
  data_validade?: string | null;
  quantidade: number;
  custo_unitario: number;
  quantidade_minima?: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueProducaoUpdate = {
  lote?: string;
  data_producao?: string;
  data_validade?: string | null;
  quantidade?: number;
  quantidade_minima?: number;
  custo_unitario?: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueInsumo = {
  id: string;
  id_estoque_insumo: string;
  lote: string;
  data_entrada: string;
  data_validade?: string | null;
  quantidade: number;
  quantidade_minima: number;
  custo_unitario: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueInsumoCreate = {
  id_estoque_insumo: string;
  lote: string;
  data_entrada: string;
  data_validade?: string | null;
  quantidade: number;
  custo_unitario: number;
  quantidade_minima?: number;
  localizacao?: string | null;
  observacoes?: string | null;
};

export type ItemEstoqueInsumoUpdate = {
  lote?: string;
  data_entrada?: string;
  data_validade?: string | null;
  quantidade?: number;
  quantidade_minima?: number;
  custo_unitario?: number;
  localizacao?: string | null;
  observacoes?: string | null;
};
