import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminHomeApi, type UpdateUserPayload } from "./admin-home.api";
import type { Company, CompanyFormState, User, UserFormState } from "./types";

type AdminHomeDialogsProps = {
    companies: Company[];
    editingCompany: Company | null;
    editingUser: User | null;
    onCloseCompany: () => void;
    onCloseUser: () => void;
    onCompanyUpdated: (companyId: string, form: CompanyFormState) => void;
    onUserUpdated: (userId: string, form: UserFormState) => void;
};

const emptyCompanyForm: CompanyFormState = {
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    email: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    logo_url: "",
};

const emptyUserForm: UserFormState = {
    login: "",
    nome: "",
    perfil: "",
    id_empresa: "",
    senha: "",
};

const buildCompanyForm = (company: Company): CompanyFormState => ({
    cnpj: company.cnpj ?? "",
    razao_social: company.razao_social ?? "",
    nome_fantasia: company.nome_fantasia ?? "",
    email: company.email ?? "",
    telefone: company.telefone ?? "",
    cep: company.cep ?? "",
    logradouro: company.logradouro ?? "",
    numero: company.numero ?? "",
    complemento: company.complemento ?? "",
    bairro: company.bairro ?? "",
    cidade: company.cidade ?? "",
    estado: company.estado ?? "",
    logo_url: company.logo_url ?? "",
});

const buildUserForm = (userItem: User): UserFormState => ({
    login: userItem.login ?? "",
    nome: userItem.nome ?? "",
    perfil: userItem.perfil ?? "",
    id_empresa: userItem.id_empresa ?? "",
    senha: "",
});

export const AdminHomeDialogs = ({
    companies,
    editingCompany,
    editingUser,
    onCloseCompany,
    onCloseUser,
    onCompanyUpdated,
    onUserUpdated,
}: AdminHomeDialogsProps) => {
    const [companyForm, setCompanyForm] = useState<CompanyFormState>(emptyCompanyForm);
    const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
    const [companySaving, setCompanySaving] = useState(false);
    const [userSaving, setUserSaving] = useState(false);

    useEffect(() => {
        if (editingCompany) {
            setCompanyForm(buildCompanyForm(editingCompany));
            return;
        }
        setCompanyForm(emptyCompanyForm);
    }, [editingCompany]);

    useEffect(() => {
        if (editingUser) {
            setUserForm(buildUserForm(editingUser));
            return;
        }
        setUserForm(emptyUserForm);
    }, [editingUser]);

    const handleUpdateCompany = async () => {
        if (!editingCompany) return;
        try {
            setCompanySaving(true);
            await adminHomeApi.updateCompany(editingCompany.id, {
                cnpj: companyForm.cnpj,
                razao_social: companyForm.razao_social,
                nome_fantasia: companyForm.nome_fantasia,
                telefone: companyForm.telefone,
                email: companyForm.email,
                cep: companyForm.cep,
                logradouro: companyForm.logradouro,
                numero: companyForm.numero,
                complemento: companyForm.complemento || undefined,
                bairro: companyForm.bairro,
                cidade: companyForm.cidade,
                estado: companyForm.estado,
                logo_url: companyForm.logo_url || undefined,
            });
            toast.success("Empresa atualizada com sucesso.");
            onCompanyUpdated(editingCompany.id, companyForm);
            onCloseCompany();
        } catch (err: unknown) {
            console.error("Erro ao atualizar empresa:", err);
            toast.error("Não foi possível atualizar a empresa.");
        } finally {
            setCompanySaving(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            setUserSaving(true);
            const payload: UpdateUserPayload = {
                login: userForm.login,
                nome: userForm.nome,
                perfil: userForm.perfil,
                id_empresa: userForm.id_empresa || null,
            };

            if (userForm.senha.trim()) {
                payload.senha = userForm.senha;
            }

            await adminHomeApi.updateUser(editingUser.id, payload);
            toast.success("Usuário atualizado com sucesso.");
            onUserUpdated(editingUser.id, userForm);
            onCloseUser();
        } catch (err: unknown) {
            console.error("Erro ao atualizar usuário:", err);
            toast.error("Não foi possível atualizar o usuário.");
        } finally {
            setUserSaving(false);
        }
    };

    return (
        <>
            <Dialog open={!!editingCompany} onOpenChange={(open) => !open && onCloseCompany()}>
                <DialogContent className="h-[90vh] max-h-[90vh] overflow-y-auto sm:w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Editar empresa</DialogTitle>
                        <DialogDescription>Atualize os dados da empresa.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">CNPJ</label>
                                <Input
                                    value={companyForm.cnpj}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, cnpj: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Razão social</label>
                                <Input
                                    value={companyForm.razao_social}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, razao_social: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nome fantasia</label>
                                <Input
                                    value={companyForm.nome_fantasia}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, nome_fantasia: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Telefone</label>
                                <Input
                                    value={companyForm.telefone}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, telefone: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <Input
                                    type="email"
                                    value={companyForm.email}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">CEP</label>
                                <Input
                                    value={companyForm.cep}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, cep: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Logradouro</label>
                                <Input
                                    value={companyForm.logradouro}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, logradouro: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Número</label>
                                <Input
                                    value={companyForm.numero}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, numero: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Complemento</label>
                                <Input
                                    value={companyForm.complemento}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, complemento: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Bairro</label>
                                <Input
                                    value={companyForm.bairro}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, bairro: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Cidade</label>
                                <Input
                                    value={companyForm.cidade}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, cidade: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Estado</label>
                                <Input
                                    value={companyForm.estado}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, estado: event.target.value }))
                                    }
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Logo URL</label>
                                <Input
                                    value={companyForm.logo_url}
                                    onChange={(event) =>
                                        setCompanyForm((prev) => ({ ...prev, logo_url: event.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onCloseCompany} disabled={companySaving}>
                            Cancelar
                        </Button>
                        <Button type="button" className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]" onClick={handleUpdateCompany} disabled={companySaving}>
                            Salvar alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && onCloseUser()}>
                <DialogContent className="sm:w-[520px]">
                    <DialogHeader>
                        <DialogTitle>Editar usuário</DialogTitle>
                        <DialogDescription>Atualize os dados do usuário.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Login</label>
                                <Input
                                    value={userForm.login}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, login: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Nome</label>
                                <Input
                                    value={userForm.nome}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, nome: event.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Perfil</label>
                                <select
                                    value={userForm.perfil}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, perfil: event.target.value }))
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="" disabled>
                                        Selecione um perfil
                                    </option>
                                    <option value="gerente">gerente</option>
                                    <option value="operador">operador</option>
                                    <option value="vendedor">vendedor</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Empresa</label>
                                <select
                                    value={userForm.id_empresa}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, id_empresa: event.target.value }))
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="">Nenhuma</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.nome_fantasia || company.razao_social || company.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Senha (opcional)</label>
                                <Input
                                    type="password"
                                    value={userForm.senha}
                                    onChange={(event) =>
                                        setUserForm((prev) => ({ ...prev, senha: event.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onCloseUser} disabled={userSaving}>
                            Cancelar
                        </Button>
                        <Button type="button" className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]" onClick={handleUpdateUser} disabled={userSaving}>
                            Salvar alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
