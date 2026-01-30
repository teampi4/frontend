export const TIPOS_FORMA_PAGAMENTO = [
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
  "pix",
  "boleto",
  "transferencia",
] as const;

export type TipoFormaPagamento = (typeof TIPOS_FORMA_PAGAMENTO)[number];

export type FormaPagamento = {
  id: string;
  id_empresa: string;
  tipo: TipoFormaPagamento;
  descricao?: string | null;
  taxa_juros: number;
  prazo_dias: number;
  ativo: boolean;
};

export type FormaPagamentoCreate = {
  id_empresa: string;
  tipo: TipoFormaPagamento;
  descricao?: string | null;
  taxa_juros?: number;
  prazo_dias?: number;
};

export type FormaPagamentoUpdate = {
  tipo?: TipoFormaPagamento;
  descricao?: string | null;
  taxa_juros?: number;
  prazo_dias?: number;
  ativo?: boolean;
};
