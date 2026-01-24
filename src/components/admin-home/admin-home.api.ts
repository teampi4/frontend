import { httpClient } from "@/lib/http/axios";
import type { Company, User } from "./types";

export type UpdateCompanyPayload = {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    telefone: string;
    email: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    logo_url?: string;
};

export type UpdateUserPayload = {
    login: string;
    nome: string;
    perfil: string;
    id_empresa: string | null;
    senha?: string;
};

export const adminHomeApi = {
    getCompanies: () => httpClient.get<Company[]>("/empresas/ativos"),
    getUsers: () => httpClient.get<User[]>("/usuarios/ativos"),
    updateCompany: (companyId: string, payload: UpdateCompanyPayload) =>
        httpClient.put(`/empresas/${companyId}`, payload),
    updateUser: (userId: string, payload: UpdateUserPayload) =>
        httpClient.put(`/usuarios/${userId}`, payload),
    deleteCompany: (companyId: string) => httpClient.delete(`/empresas/${companyId}`),
    deleteUser: (userId: string) => httpClient.delete(`/usuarios/${userId}`),
};
