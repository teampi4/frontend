import { z } from "zod";

export const companySchema = z.object({
    cnpj: z.string().min(1, "Informe o CNPJ."),
    razao_social: z.string().min(1, "Informe a razão social."),
    nome_fantasia: z.string().min(1, "Informe o nome fantasia."),
    telefone: z.string().min(1, "Informe o telefone."),
    email: z.string().email("Email inválido."),
    cep: z.string().min(1, "Informe o CEP."),
    logradouro: z.string().min(1, "Informe o logradouro."),
    numero: z.string().min(1, "Informe o número."),
    complemento: z.string().optional(),
    bairro: z.string().min(1, "Informe o bairro."),
    cidade: z.string().min(1, "Informe a cidade."),
    estado: z.string().min(1, "Informe o estado.").max(2, "Apenas a sigla."),
    logo_url: z.string().optional(),
});

export const userSchema = z.object({
    login: z.string().min(1, "Informe o login."),
    nome: z.string().min(1, "Informe o nome."),
    perfil: z.string().min(1, "Informe o perfil."),
    id_empresa: z.string().min(1, "Informe o ID da empresa."),
    senha: z.string().min(3, "A senha deve ter pelo menos 3 caracteres."),
});

export type CompanyValues = z.infer<typeof companySchema>;
export type UserValues = z.infer<typeof userSchema>;
