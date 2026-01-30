export type EstoqueInsumo = {
  id: string;
  codigo: string;
  nome: string;
  unidade_medida: string;
  descricao?: string | null;
  fornecedor?: string | null;
  custo_unitario: number;
  id_empresa: string;
  ativo: boolean;
  data_cadastro: string;
};

export type EstoqueInsumoCreate = {
  codigo: string;
  nome: string;
  unidade_medida: string;
  descricao?: string | null;
  fornecedor?: string | null;
  custo_unitario: number;
  id_empresa: string;
};

export type EstoqueInsumoUpdate = {
  codigo?: string;
  nome?: string;
  unidade_medida?: string;
  descricao?: string | null;
  fornecedor?: string | null;
  custo_unitario?: number;
  ativo?: boolean;
};
