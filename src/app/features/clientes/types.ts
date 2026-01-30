export type TipoPessoa = "PF" | "PJ";

export type Cliente = {
  id: string;
  id_empresa: string;
  tipo_pessoa: TipoPessoa;
  cpf_cnpj: string;
  contato_nome: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  telefone?: string | null;
  celular?: string | null;
  email?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  data_cadastro: string;
};

export type ClienteCreate = {
  id_empresa: string;
  tipo_pessoa: TipoPessoa;
  cpf_cnpj: string;
  contato_nome: string;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  telefone?: string | null;
  celular?: string | null;
  email?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacoes?: string | null;
};

export type ClienteUpdate = Partial<Omit<ClienteCreate, "id_empresa">> & { ativo?: boolean };
