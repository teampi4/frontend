export type ItemVendaRead = {
  id: string;
  id_venda: string;
  id_item_estoque_produto: string;
  quantidade: number;
  preco_unitario: number;
  desconto: number;
  valor_total: number;
  observacao?: string | null;
  data_cadastro: string;
};

export type Venda = {
  id: string;
  numero_venda: string;
  data_venda: string;
  status: string;
  parcelas: number;
  desconto: number;
  observacoes?: string | null;
  id_empresa: string;
  id_cliente: string;
  id_forma_pagamento: string;
  valor_total: number;
  valor_liquido: number;
  data_cadastro: string;
};

export type VendaWithItens = Venda & { itens: ItemVendaRead[] };

export type ClienteResumo = {
  id: string;
  nome_fantasia?: string;
  razao_social?: string;
};

export type FormaPagamentoResumo = {
  id: string;
  tipo: string;
  descricao?: string;
};

export type ItemVendaCreate = {
  id_item_estoque_produto: string;
  quantidade: number;
  preco_unitario: number;
  desconto?: number;
  observacao?: string | null;
};

export type VendaCreate = {
  numero_venda: string;
  data_venda: string;
  status: string;
  parcelas: number;
  desconto: number;
  observacoes?: string | null;
  id_empresa: string;
  id_cliente: string;
  id_forma_pagamento: string;
  itens: ItemVendaCreate[];
};

export type VendaUpdate = {
  numero_venda?: string;
  data_venda?: string;
  id_cliente?: string;
  id_forma_pagamento?: string;
  status?: string;
  parcelas?: number;
  desconto?: number;
  observacoes?: string | null;
};
