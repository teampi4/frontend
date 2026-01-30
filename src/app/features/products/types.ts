export type EstoqueProduto = {
  id: string;
  codigo: string;
  nome: string;
  unidade_medida: string;
  descricao?: string | null;
  custo_producao: number;
  preco_venda: number;
  id_empresa: string;
  ativo: boolean;
  data_cadastro: string;
};

export type EstoqueProdutoCreate = {
  codigo: string;
  nome: string;
  unidade_medida: string;
  descricao?: string | null;
  custo_producao: number;
  preco_venda: number;
  id_empresa: string;
};

export type EstoqueProdutoUpdate = {
  codigo?: string;
  nome?: string;
  unidade_medida?: string;
  descricao?: string | null;
  custo_producao?: number;
  preco_venda?: number;
  ativo?: boolean;
};
