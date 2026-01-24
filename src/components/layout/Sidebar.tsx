import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import { getAuth, logout } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { httpClient } from "@/lib/http/axios";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";


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

    const companySchema = z.object({
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

    const userSchema = z.object({
        login: z.string().min(1, "Informe o login."),
        nome: z.string().min(1, "Informe o nome."),
        perfil: z.string().min(1, "Informe o perfil."),
        id_empresa: z.string().min(1, "Informe o ID da empresa."),
        senha: z.string().min(3, "A senha deve ter pelo menos 3 caracteres."),
    });

    type CompanyValues = z.infer<typeof companySchema>;
    type UserValues = z.infer<typeof userSchema>;

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
            >("/empresas");
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
        { label: "Início", icon: Home, action: () => navigate('/dashboard/inicio') },
        { label: "Inventário", icon: Package, action: () => navigate('/dashboard/inventario') },
        { label: "Produção", icon: Factory, action: () => navigate('/dashboard/producao') },
        { label: "Produtos e serviços", icon: Boxes, action: () => navigate('/dashboard/produtos') },
        { label: "Vendas", icon: ShoppingCart, action: () => navigate('/dashboard/vendas') },
        { label: "Finanças", icon: Wallet, action: () => navigate('/dashboard/financas') },
        { label: "Cadastros", icon: Users, action: () => navigate('/dashboard/cadastros') },
        { label: "Relatórios", icon: BarChart3, action: () => navigate('/dashboard/relatorios') },
    ];

    const isAdmin = (usuario?.perfil ?? "").toLowerCase().includes("admin");
    const userName = usuario?.nome ?? usuario?.login ?? "Usuário";
    const userInitial = userName.trim().charAt(0).toUpperCase() || "U";


    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate("/auth/entrar");
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
                <img src={perfil} alt="perfil" />
            </div>
            {!isAdmin &&
                <nav className="flex flex-col gap-6">
                    {navItems.map(({ label, icon: Icon, action}) => (
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
                    <Dialog
                        open={isCompanyDialogOpen}
                        onOpenChange={(open) => {
                            setIsCompanyDialogOpen(open);
                            if (!open) {
                                companyForm.reset();
                            }
                        }}
                    >
                        <DialogContent className="h-[90vh] max-h-[90vh] overflow-y-auto sm:w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Cadastrar empresa</DialogTitle>
                                <DialogDescription>
                                    Informe os dados da empresa.
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                className="space-y-6"
                                onSubmit={companyForm.handleSubmit(handleSubmitCompany)}
                            >
                                <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Controller
                                        control={companyForm.control}
                                        name="cnpj"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>CNPJ</FieldLabel>
                                                <Input
                                                    {...field}
                                                    inputMode="numeric"
                                                    maxLength={18}
                                                    placeholder="00.000.000/0000-00"
                                                    aria-invalid={fieldState.invalid}
                                                    onChange={(event) => field.onChange(formatCnpj(event.target.value))}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="razao_social"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Razão social</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="nome_fantasia"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Nome fantasia</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="telefone"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Telefone</FieldLabel>
                                                <Input
                                                    {...field}
                                                    inputMode="numeric"
                                                    maxLength={15}
                                                    placeholder="(00) 00000-0000"
                                                    aria-invalid={fieldState.invalid}
                                                    onChange={(event) => field.onChange(formatTelefone(event.target.value))}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="email"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Email</FieldLabel>
                                                <Input type="email" {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="cep"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>CEP</FieldLabel>
                                                <Input
                                                    {...field}
                                                    inputMode="numeric"
                                                    maxLength={9}
                                                    placeholder="00000-000"
                                                    aria-invalid={fieldState.invalid}
                                                    onChange={(event) => field.onChange(formatCep(event.target.value))}
                                                />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="logradouro"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Logradouro</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="numero"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Número</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="complemento"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Complemento</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="bairro"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Bairro</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="cidade"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Cidade</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={companyForm.control}
                                        name="estado"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Estado</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <div className="sm:col-span-2">
                                        <Controller
                                            control={companyForm.control}
                                            name="logo_url"
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Logo URL</FieldLabel>
                                                    <Input {...field} aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </div>
                                </FieldGroup>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]"
                                        disabled={companyForm.formState.isSubmitting}
                                    >
                                        Cadastrar empresa
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={isUserDialogOpen}
                        onOpenChange={(open) => {
                            setIsUserDialogOpen(open);
                            if (!open) {
                                userForm.reset({ id_empresa: lastCompanyId ?? "" });
                            }
                        }}
                    >
                        <DialogContent className="sm:w-[520px]">
                            <DialogHeader>
                                <DialogTitle>Cadastrar usuário</DialogTitle>
                                <DialogDescription>
                                    Informe os dados do usuário.
                                </DialogDescription>
                            </DialogHeader>

                            <form
                                className="space-y-6"
                                onSubmit={userForm.handleSubmit(handleSubmitUser)}
                            >
                                <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Controller
                                            control={userForm.control}
                                            name="login"
                                            render={({ field, fieldState }) => (
                                                <Field>
                                                    <FieldLabel>Login</FieldLabel>
                                                    <Input {...field} aria-invalid={fieldState.invalid} />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                    </div>
                                    <Controller
                                        control={userForm.control}
                                        name="nome"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Nome</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={userForm.control}
                                        name="perfil"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Perfil</FieldLabel>
                                                <Input {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={userForm.control}
                                        name="id_empresa"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>ID da empresa</FieldLabel>
                                                <select
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                    ref={field.ref}
                                                    disabled={companiesLoading}
                                                    aria-invalid={fieldState.invalid}
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="" disabled>
                                                        {companiesLoading ? "Carregando empresas..." : "Selecione uma empresa"}
                                                    </option>
                                                    {companies.map((company) => (
                                                        <option key={company.id} value={company.id}>
                                                            {company.nome_fantasia || company.razao_social}
                                                        </option>
                                                    ))}
                                                </select>
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                    <Controller
                                        control={userForm.control}
                                        name="senha"
                                        render={({ field, fieldState }) => (
                                            <Field>
                                                <FieldLabel>Senha</FieldLabel>
                                                <Input type="password" {...field} aria-invalid={fieldState.invalid} />
                                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                            </Field>
                                        )}
                                    />
                                </FieldGroup>

                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]"
                                        disabled={userForm.formState.isSubmitting}
                                    >
                                        Cadastrar usuário
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </aside>
    );
}
