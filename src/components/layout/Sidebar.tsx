import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import perfil from "/src/assets/profile.png";
import {
  Home,
  Package,
  Factory,
  Boxes,
  ShoppingCart,
  Wallet,
  Users,
  BarChart3,
  UserPlus,
  Building2,
  FlaskConical,
} from "lucide-react";
import { getAuth, logout } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { httpClient } from "@/lib/http/axios";
import { SidebarAdminDialogs } from "@/components/layout/SidebarAdminDialogs";
import { companySchema, userSchema, type CompanyValues, type UserValues } from "@/components/layout/sidebar-admin-dialogs.schema";
import { SidebarProfileDialog, type ProfileFormValues } from "@/components/layout/SidebarProfileDialog";


export const Sidebar = () => {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [lastCompanyId, setLastCompanyId] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Array<{ id: string; nome_fantasia: string; razao_social: string }>>(
        [],
    );
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const { usuario } = getAuth();
    const [currentUser, setCurrentUser] = useState(usuario);
    const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

    const companyForm = useForm<CompanyValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            cnpj: "",
            razao_social: "",
            nome_fantasia: "",
            telefone: "",
            email: "",
            cep: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            logo_url: "",
        },
    });

    const userForm = useForm<UserValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            login: "",
            nome: "",
            perfil: "",
            id_empresa: "",
            senha: "",
        },
    });

    const loadCompanies = useCallback(async () => {
        try {
            setCompaniesLoading(true);
            const { data } = await httpClient.get<
                Array<{ id: string; nome_fantasia: string; razao_social: string }>
            >("/empresas/ativos");
            setCompanies(data ?? []);
            if (data?.length && !userForm.getValues("id_empresa")) {
                userForm.setValue("id_empresa", data[0].id);
            }
        } catch (err: unknown) {
            console.error("Erro ao carregar empresas:", err);
            toast.error("Não foi possível carregar as empresas.");
        } finally {
            setCompaniesLoading(false);
        }
    }, [userForm]);
    const formatCnpj = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 14);
        return digits
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    };

    const formatTelefone = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        if (digits.length <= 10) {
            return digits
                .replace(/^(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        }
        return digits
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2");
    };

    const formatCep = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 8);
        return digits.replace(/^(\d{5})(\d)/, "$1-$2");
    };

    useEffect(() => {
        if (isUserDialogOpen) {
            if (lastCompanyId) {
                userForm.setValue("id_empresa", lastCompanyId);
            }
            loadCompanies();
        }
    }, [isUserDialogOpen, lastCompanyId, loadCompanies, userForm]);
    const navItems = [
        { label: "Início", icon: Home, action: () => navigate("/dashboard/inicio") },
        { label: "Inventário", icon: Package, action: () => navigate("/dashboard/inventario") },
        { label: "Insumos", icon: FlaskConical, action: () => navigate("/dashboard/insumos") },
        { label: "Produção", icon: Factory, action: () => navigate("/dashboard/producao") },
        { label: "Produtos e serviços", icon: Boxes, action: () => navigate("/dashboard/produtos") },
        { label: "Vendas", icon: ShoppingCart, action: () => navigate("/dashboard/vendas") },
        { label: "Finanças", icon: Wallet, action: () => navigate("/dashboard/financas") },
        { label: "Cadastros", icon: Users, action: () => navigate("/dashboard/cadastros") },
        { label: "Relatórios", icon: BarChart3, action: () => navigate("/dashboard/relatorios") },
    ];

    const userRole = (currentUser?.perfil ?? "").toLowerCase();
    const isAdmin = useMemo(() => userRole.includes("admin"), [userRole]);
    const userName = currentUser?.nome ?? currentUser?.login ?? "Usuário";
    const userInitial = userName.trim().charAt(0).toUpperCase() || "U";
    const filteredNavItems = useMemo(() => {
        if (userRole.includes("gerente")) {
            return navItems;
        }
        if (userRole.includes("operador")) {
            return navItems.filter((item) =>
                ["Início", "Inventário", "Insumos", "Produção", "Produtos e serviços"].includes(item.label),
            );
        }
        if (userRole.includes("vendedor")) {
            return navItems.filter((item) =>
                ["Início", "Produtos e serviços", "Vendas"].includes(item.label),
            );
        }
        return navItems.filter((item) => item.label === "Início");
    }, [navItems, userRole]);
    const profileForm = useForm<ProfileFormValues>({
        defaultValues: {
            login: currentUser?.login ?? "",
            nome: currentUser?.nome ?? "",
            senha: "",
        },
    });

    useEffect(() => {
        if (!currentUser?.id_empresa) {
            setCompanyLogoUrl(null);
            return;
        }

        let isMounted = true;
        const loadCompanyLogo = async () => {
            try {
                const { data } = await httpClient.get<{ logo_url?: string }>(`/empresas/${currentUser.id_empresa}`);
                if (isMounted) {
                    setCompanyLogoUrl(data?.logo_url ?? null);
                }
            } catch (err: unknown) {
                console.error("Erro ao carregar logo da empresa:", err);
                if (isMounted) {
                    setCompanyLogoUrl(null);
                }
            }
        };

        loadCompanyLogo();

        return () => {
            isMounted = false;
        };
    }, [currentUser?.id_empresa]);


    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate("/auth/entrar");
    };

    const handleOpenProfileDialog = () => {
        if (!currentUser) return;
        profileForm.reset({
            login: currentUser.login ?? "",
            nome: currentUser.nome ?? "",
            senha: "",
        });
        setIsProfileDialogOpen(true);
        setIsUserMenuOpen(false);
    };

    const handleUpdateProfile = async (values: ProfileFormValues) => {
        if (!currentUser) return;
        try {
            const payload: Record<string, unknown> = {
                login: values.login,
                nome: values.nome,
                perfil: currentUser.perfil,
                id_empresa: currentUser.id_empresa ?? null,
            };

            if (values.senha.trim()) {
                payload.senha = values.senha;
            }

            await httpClient.put(`/usuarios/${currentUser.id}`, payload);
            toast.success("Perfil atualizado com sucesso.");
            const updatedUser = {
                ...currentUser,
                login: values.login,
                nome: values.nome,
            };
            localStorage.setItem("usuario", JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            setIsProfileDialogOpen(false);
        } catch (err: unknown) {
            console.error("Erro ao atualizar perfil:", err);
            toast.error("Não foi possível atualizar o perfil.");
        }
    };

    const handleDeleteProfile = async () => {
        if (!currentUser) return;
        const confirmed = window.confirm("Tem certeza que deseja excluir seu perfil?");
        if (!confirmed) return;

        try {
            await httpClient.delete(`/usuarios/${currentUser.id}`);
            toast.success("Perfil excluído com sucesso.");
            handleLogout();
        } catch (err: unknown) {
            console.error("Erro ao excluir perfil:", err);
            toast.error("Não foi possível excluir o perfil.");
        }
    };

    const handleSubmitCompany = async (values: CompanyValues) => {
        try {
            const { data: empresa } = await httpClient.post<{ id: string }>("/empresas", {
                cnpj: values.cnpj,
                razao_social: values.razao_social,
                nome_fantasia: values.nome_fantasia,
                telefone: values.telefone,
                email: values.email,
                cep: values.cep,
                logradouro: values.logradouro,
                numero: values.numero,
                complemento: values.complemento,
                bairro: values.bairro,
                cidade: values.cidade,
                estado: values.estado,
                logo_url: values.logo_url,
            });

            toast.success("Empresa cadastrada com sucesso.");
            setLastCompanyId(empresa.id);
            userForm.setValue("id_empresa", empresa.id);
            setCompanies((prev) => [
                ...prev,
                {
                    id: empresa.id,
                    nome_fantasia: values.nome_fantasia,
                    razao_social: values.razao_social,
                },
            ]);
            setIsCompanyDialogOpen(false);
            companyForm.reset();
        } catch (err: unknown) {
            console.error("Erro ao cadastrar empresa:", err);
            toast.error("Não foi possível cadastrar a empresa.");
        }
    };

    const handleSubmitUser = async (values: UserValues) => {
        try {
            await httpClient.post("/usuarios", {
                login: values.login,
                nome: values.nome,
                perfil: values.perfil,
                id_empresa: values.id_empresa,
                senha: values.senha,
            });

            toast.success("Usuário cadastrado com sucesso.");
            setIsUserDialogOpen(false);
            userForm.reset({ id_empresa: lastCompanyId ?? "" });
        } catch (err: unknown) {
            console.error("Erro ao cadastrar usuário:", err);
            toast.error("Não foi possível cadastrar o usuário.");
        }
    };

    return (
        <aside className="w-20 h-screen flex flex-col items-center py-6">
            <div className='border-b pb-4 w-full flex justify-center mb-4'>
                <img src={companyLogoUrl || perfil} alt="logo" className="h-10 w-10 object-contain" />
            </div>
            {!isAdmin &&
                <nav className="flex flex-col gap-6">
                    {filteredNavItems.map(({ label, icon: Icon, action }) => (
                    <button
                        key={label}
                        className="
                        flex flex-col items-center gap-1
                        text-gray-700 hover:text-blue-600
                        transition-colors
                        "
                        onClick={action}
                    >
                        <Icon size={22} />
                        <span className="text-xs text-center leading-tight">
                            {label}
                        </span>
                    </button>
                    ))}
                </nav>
            }

            {isAdmin && (
                <div className="mt-6 flex flex-col items-center gap-4">
                    <button
                        type="button"
                        className="
                        flex flex-col items-center gap-1
                        text-gray-700 hover:text-blue-600
                        transition-colors
                        "
                        onClick={() => setIsCompanyDialogOpen(true)}
                    >
                        <Building2 size={22} />
                        <span className="text-xs text-center leading-tight">
                            Nova empresa
                        </span>
                    </button>
                    <button
                        type="button"
                        className="
                        flex flex-col items-center gap-1
                        text-gray-700 hover:text-blue-600
                        transition-colors
                        "
                        onClick={() => setIsUserDialogOpen(true)}
                    >
                        <UserPlus size={22} />
                        <span className="text-xs text-center leading-tight">
                            Novo usuário
                        </span>
                    </button>
                </div>
            )}

            <div className="mt-auto relative flex flex-col items-center">
                <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="mt-6 h-10 w-10 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    title={userName}
                >
                    {userInitial}
                </button>

                {isUserMenuOpen && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border shadow-md rounded-md">
                        <button
                            type="button"
                            onClick={handleOpenProfileDialog}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                        >
                            Editar perfil
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteProfile}
                            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-center"
                        >
                            Excluir perfil
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 text-center"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>

            {isAdmin && (
                <>
                    <SidebarAdminDialogs
                        isCompanyDialogOpen={isCompanyDialogOpen}
                        isUserDialogOpen={isUserDialogOpen}
                        onCompanyDialogChange={(open) => {
                            setIsCompanyDialogOpen(open);
                            if (!open) {
                                companyForm.reset();
                            }
                        }}
                        onUserDialogChange={(open) => {
                            setIsUserDialogOpen(open);
                            if (!open) {
                                userForm.reset({ id_empresa: lastCompanyId ?? "" });
                            }
                        }}
                        companyForm={companyForm}
                        userForm={userForm}
                        companies={companies}
                        companiesLoading={companiesLoading}
                        onSubmitCompany={handleSubmitCompany}
                        onSubmitUser={handleSubmitUser}
                        formatCep={formatCep}
                        formatCnpj={formatCnpj}
                        formatTelefone={formatTelefone}
                    />
                </>
            )}

            <SidebarProfileDialog
                open={isProfileDialogOpen}
                onOpenChange={setIsProfileDialogOpen}
                form={profileForm}
                onSubmit={handleUpdateProfile}
            />
        </aside>
    );
}
