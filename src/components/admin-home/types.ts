export type Company = {
    id: string;
    cnpj?: string;
    razao_social?: string;
    nome_fantasia?: string;
    email?: string;
    telefone?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    logo_url?: string;
};

export type User = {
    id: string;
    login?: string;
    nome?: string;
    perfil?: string;
    id_empresa?: string;
};

export type CompanyFormState = {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    email: string;
    telefone: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    logo_url: string;
};

export type UserFormState = {
    login: string;
    nome: string;
    perfil: string;
    id_empresa: string;
    senha: string;
};
