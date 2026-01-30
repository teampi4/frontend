export type EstoqueProducao = {
  id: string;
  codigo: string;
  nome: string;
  unidade_medida: string;
  descricao?: string | null;
  custo_producao: number;
  id_empresa: string;
  ativo: boolean;
  data_cadastro: string;
};

export type EstoqueProducaoCreate = {
  codigo: string;
  nome: string;
  unidade_medida: string;
  descricao?: string | null;
  custo_producao: number;
  id_empresa: string;
};

export type EstoqueProducaoUpdate = {
  codigo?: string;
  nome?: string;
  unidade_medida?: string;
  descricao?: string | null;
  custo_producao?: number;
  ativo?: boolean;
};
