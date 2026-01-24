import { useHeader } from "@/hooks/useHeader";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminHomeDialogs } from "@/components/admin-home/AdminHomeDialogs";
import { adminHomeApi } from "@/components/admin-home/admin-home.api";
import type { Company, CompanyFormState, User, UserFormState } from "@/components/admin-home/types";

export const DashboardHome = () => {
    const { setHeader } = useHeader();
    const { usuario } = getAuth();
    const isAdmin = useMemo(
        () => (usuario?.perfil ?? "").toLowerCase().includes("admin"),
        [usuario?.perfil],
    );
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);


    useEffect(() => {
        setHeader({
            pageName: "Início",
            pathPage: null,
            actions: null,
        });


        return () => {
            setHeader({
                pageName: "",
                pathPage: null,
                actions: null,
            });
        }
    }, [setHeader]);

    const loadCompanies = useCallback(async () => {
        try {
            setCompaniesLoading(true);
            const { data } = await adminHomeApi.getCompanies();
            setCompanies(data ?? []);
        } catch (err: unknown) {
            console.error("Erro ao carregar empresas:", err);
            toast.error("Não foi possível carregar as empresas.");
        } finally {
            setCompaniesLoading(false);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            const { data } = await adminHomeApi.getUsers();
            setUsers(data ?? []);
        } catch (err: unknown) {
            console.error("Erro ao carregar usuários:", err);
            toast.error("Não foi possível carregar os usuários.");
        } finally {
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        loadCompanies();
    }, [isAdmin, loadCompanies]);

    useEffect(() => {
        if (!isAdmin) return;
        loadUsers();
    }, [isAdmin, loadUsers]);

    const handleEditCompany = (company: Company) => {
        setEditingCompany(company);
    };

    const handleEditUser = (userItem: User) => {
        setEditingUser(userItem);
    };

    const handleDeleteCompany = async (company: Company) => {
        const confirmed = window.confirm("Tem certeza que deseja deletar esta empresa?");
        if (!confirmed) return;

        try {
            await adminHomeApi.deleteCompany(company.id);
            toast.success("Empresa deletada com sucesso.");
            setCompanies((prev) => prev.filter((item) => item.id !== company.id));
        } catch (err: unknown) {
            console.error("Erro ao deletar empresa:", err);
            toast.error("Não foi possível deletar a empresa.");
        }
    };

    const handleDeleteUser = async (userItem: User) => {
        const confirmed = window.confirm("Tem certeza que deseja deletar este usuário?");
        if (!confirmed) return;

        try {
            await adminHomeApi.deleteUser(userItem.id);
            toast.success("Usuário deletado com sucesso.");
            setUsers((prev) => prev.filter((item) => item.id !== userItem.id));
        } catch (err: unknown) {
            console.error("Erro ao deletar usuário:", err);
            toast.error("Não foi possível deletar o usuário.");
        }
    };

    const handleCompanyUpdated = (companyId: string, form: CompanyFormState) => {
        setCompanies((prev) =>
            prev.map((item) =>
                item.id === companyId
                    ? {
                        ...item,
                        ...form,
                        complemento: form.complemento || undefined,
                        logo_url: form.logo_url || undefined,
                    }
                    : item,
            ),
        );
    };

    const handleUserUpdated = (userId: string, form: UserFormState) => {
        setUsers((prev) =>
            prev.map((item) =>
                item.id === userId
                    ? {
                        ...item,
                        login: form.login,
                        nome: form.nome,
                        perfil: form.perfil,
                        id_empresa: form.id_empresa || undefined,
                    }
                    : item,
            ),
        );
    };
    
    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao Dashboard</h1>
            {isAdmin ? (
                <div className="space-y-6">
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Empresas ativas cadastradas </h2>
                            <p className="text-sm text-slate-500">Lista de empresas já registradas no sistema.</p>
                        </div>
                        {companiesLoading ? (
                            <div className="text-sm text-slate-500">Carregando empresas...</div>
                        ) : companies.length === 0 ? (
                            <div className="text-sm text-slate-500">Nenhuma empresa cadastrada ainda.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-slate-200 text-left text-slate-500">
                                        <tr>
                                            <th className="py-2 pr-4 font-medium">ID</th>
                                            <th className="py-2 pr-4 font-medium">Nome fantasia</th>
                                            <th className="py-2 pr-4 font-medium">Razão social</th>
                                            <th className="py-2 pr-4 font-medium">CNPJ</th>
                                            <th className="py-2 pr-4 font-medium">Cidade/UF</th>
                                            <th className="py-2 pr-4 font-medium">Contato</th>
                                            <th className="py-2 pr-4 font-medium">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {companies.map((company) => (
                                            <tr key={company.id} className="text-slate-700">
                                                <td className="py-2 pr-4 font-mono text-xs text-slate-500">
                                                    {company.id}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {company.nome_fantasia || "-"}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {company.razao_social || "-"}
                                                </td>
                                                <td className="py-2 pr-4">{company.cnpj || "-"}</td>
                                                <td className="py-2 pr-4">
                                                    {company.cidade || "-"}
                                                    {company.estado ? `/${company.estado}` : ""}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <div>{company.email || "-"}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {company.telefone || "-"}
                                                    </div>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => handleEditCompany(company)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteCompany(company)}
                                                        >
                                                            Deletar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Usuários ativos cadastrados</h2>
                            <p className="text-sm text-slate-500">Lista de usuários já registrados no sistema.</p>
                        </div>
                        {usersLoading ? (
                            <div className="text-sm text-slate-500">Carregando usuários...</div>
                        ) : users.length === 0 ? (
                            <div className="text-sm text-slate-500">Nenhum usuário cadastrado ainda.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="border-b border-slate-200 text-left text-slate-500">
                                        <tr>
                                            <th className="py-2 pr-4 font-medium">ID</th>
                                            <th className="py-2 pr-4 font-medium">Nome</th>
                                            <th className="py-2 pr-4 font-medium">Login</th>
                                            <th className="py-2 pr-4 font-medium">Perfil</th>
                                            <th className="py-2 pr-4 font-medium">Empresa</th>
                                            <th className="py-2 pr-4 font-medium">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((userItem) => (
                                            <tr key={userItem.id} className="text-slate-700">
                                                <td className="py-2 pr-4 font-mono text-xs text-slate-500">
                                                    {userItem.id}
                                                </td>
                                                <td className="py-2 pr-4">{userItem.nome || "-"}</td>
                                                <td className="py-2 pr-4">{userItem.login || "-"}</td>
                                                <td className="py-2 pr-4">{userItem.perfil || "-"}</td>
                                                <td className="py-2 pr-4">{userItem.id_empresa || "-"}</td>
                                                <td className="py-2 pr-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => handleEditUser(userItem)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteUser(userItem)}
                                                        >
                                                            Deletar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            ) : (
                <p className="text-sm text-slate-500">
                    Você está logado como usuário padrão.
                </p>
            )}

            <AdminHomeDialogs
                companies={companies}
                editingCompany={editingCompany}
                editingUser={editingUser}
                onCloseCompany={() => setEditingCompany(null)}
                onCloseUser={() => setEditingUser(null)}
                onCompanyUpdated={handleCompanyUpdated}
                onUserUpdated={handleUserUpdated}
            />
        </div>
    )
}
