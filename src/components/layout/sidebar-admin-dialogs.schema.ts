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

export const clientSchema = z.object({
    tipo_pessoa: z.enum(["PF", "PJ"]),
    cpf_cnpj: z.string().min(1, "Informe CPF/CNPJ."),
    razao_social: z.string().optional(),
    nome_fantasia: z.string().optional(),
    contato_nome: z.string().optional(),
    telefone: z.string().optional(),
    celular: z.string().optional(),
    email: z.string().email("Email inválido.").optional().or(z.literal("")),
    cep: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().max(2, "Apenas a sigla.").optional(),
    observacoes: z.string().optional(),
    ativo: z.boolean().optional(),
}).refine((data) => {
    if (data.tipo_pessoa === "PJ") {
        return !!(data.razao_social && data.razao_social.trim().length > 0);
    }
    return true;
}, {
    message: "Informe a razão social para pessoa jurídica.",
    path: ["razao_social"],
});

export type CompanyValues = z.infer<typeof companySchema>;
export type UserValues = z.infer<typeof userSchema>;
export type ClientValues = z.infer<typeof clientSchema>;
