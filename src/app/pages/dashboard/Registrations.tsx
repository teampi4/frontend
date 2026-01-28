import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useHeader } from "@/hooks/useHeader";
import { getAuth } from "@/hooks/auth/useAuth";
import { httpClient } from "@/lib/http/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { clientSchema, type ClientValues } from "@/components/layout/sidebar-admin-dialogs.schema";

const registrationSchema = z.object({
    login: z.string().min(1, "Informe o login."),
    nome: z.string().min(1, "Informe o nome."),
    perfil: z.enum(["operador", "vendedor"], {
        required_error: "Selecione o perfil.",
    }),
    senha: z.string().min(3, "A senha deve ter pelo menos 3 caracteres."),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

const formatCpfCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 11) {
        return digits
            .replace(/^(\d{3})(\d)/, "$1.$2")
            .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/(\d{3})(\d)/, "$1-$2");
    }
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

export const DashboardRegistrations = () => {
    const { setHeader } = useHeader();
    const { usuario } = getAuth();
    const userRole = (usuario?.perfil ?? "").toLowerCase();
    const isManager = userRole.includes("gerente");
    const form = useForm<RegistrationValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            login: "",
            nome: "",
            perfil: "operador",
            senha: "",
        },
    });

    const clientForm = useForm<ClientValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            tipo_pessoa: "PF",
            cpf_cnpj: "",
            razao_social: "",
            nome_fantasia: "",
            contato_nome: "",
            telefone: "",
            celular: "",
            email: "",
            cep: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
            observacoes: "",
            ativo: true,
        },
    });

    useEffect(() => {
        setHeader({
            pageName: "Cadastros",
            pathPage: null,
            actions: null,
        });

        return () => {
            setHeader({
                pageName: "",
                pathPage: null,
                actions: null,
            });
        };
    }, [setHeader]);

    const handleSubmit = async (values: RegistrationValues) => {
        if (!usuario?.id_empresa) {
            toast.error("Usuário sem empresa vinculada.");
            return;
        }

        try {
            await httpClient.post("/usuarios", {
                login: values.login,
                nome: values.nome,
                perfil: values.perfil,
                id_empresa: usuario.id_empresa,
                senha: values.senha,
            });
            toast.success("Usuário cadastrado com sucesso.");
            form.reset({ login: "", nome: "", perfil: "operador", senha: "" });
        } catch (err: unknown) {
            console.error("Erro ao cadastrar usuário:", err);
            toast.error("Não foi possível cadastrar o usuário.");
        }
    };

    const handleClientSubmit = async (values: ClientValues) => {
        if (!usuario?.id_empresa) {
            toast.error("Usuário sem empresa vinculada.");
            return;
        }

        try {
            await httpClient.post("/clientes", {
                tipo_pessoa: values.tipo_pessoa,
                cpf_cnpj: values.cpf_cnpj,
                razao_social: values.razao_social || null,
                nome_fantasia: values.nome_fantasia || null,
                contato_nome: values.contato_nome || null,
                telefone: values.telefone || null,
                celular: values.celular || null,
                email: values.email || null,
                cep: values.cep || null,
                logradouro: values.logradouro || null,
                numero: values.numero || null,
                complemento: values.complemento || null,
                bairro: values.bairro || null,
                cidade: values.cidade || null,
                estado: values.estado || null,
                observacoes: values.observacoes || null,
                ativo: values.ativo ? 1 : 0,
                id_empresa: usuario.id_empresa,
            });
            toast.success("Cliente cadastrado com sucesso.");
            clientForm.reset();
        } catch (err: unknown) {
            console.error("Erro ao cadastrar cliente:", err);
            toast.error("Não foi possível cadastrar o cliente.");
        }
    };

    if (!isManager) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Acesso restrito. Apenas gerentes podem cadastrar novos usuários.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900">Cadastrar usuário</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Gerentes podem cadastrar usuários do tipo operador ou vendedor.
                </p>

                <form className="mt-6 space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Controller
                            control={form.control}
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
                    <div className="sm:col-span-2">
                        <Controller
                            control={form.control}
                            name="nome"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Nome</FieldLabel>
                                    <Input {...field} aria-invalid={fieldState.invalid} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>
                    <Controller
                        control={form.control}
                        name="perfil"
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Perfil</FieldLabel>
                                <select
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                    aria-invalid={fieldState.invalid}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="operador">operador</option>
                                    <option value="vendedor">vendedor</option>
                                </select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
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

                <div className="flex justify-end">
                    <Button type="submit" className="cursor-pointer bg-[#2A64E8] hover:bg-[#2A64E8]" disabled={form.formState.isSubmitting}>
                        Cadastrar usuário
                    </Button>
                </div>
            </form>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-xl font-semibold text-slate-900">Cadastrar cliente</h1>
                <p className="mt-1 text-sm text-slate-500">Adicione um novo cliente à empresa.</p>

                <form className="mt-6 space-y-6" onSubmit={clientForm.handleSubmit(handleClientSubmit)}>
                    <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Controller
                            control={clientForm.control}
                            name="tipo_pessoa"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Tipo Pessoa</FieldLabel>
                                    <select
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        aria-invalid={fieldState.invalid}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="PF">PF</option>
                                        <option value="PJ">PJ</option>
                                    </select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="sm:col-span-2">
                            <Controller
                                control={clientForm.control}
                                name="cpf_cnpj"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>CPF / CNPJ</FieldLabel>
                                        <Input
                                            {...field}
                                            inputMode="numeric"
                                            maxLength={18}
                                            placeholder="000.000.000-00 / 00.000.000/0000-00"
                                            aria-invalid={fieldState.invalid}
                                            onChange={(event) => field.onChange(formatCpfCnpj(event.target.value))}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Controller
                                control={clientForm.control}
                                name="razao_social"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Razão Social</FieldLabel>
                                        <Input {...field} aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={clientForm.control}
                            name="nome_fantasia"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Nome Fantasia</FieldLabel>
                                    <Input {...field} aria-invalid={fieldState.invalid} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={clientForm.control}
                            name="contato_nome"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Contato</FieldLabel>
                                    <Input {...field} aria-invalid={fieldState.invalid} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <Controller
                            control={clientForm.control}
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
                            control={clientForm.control}
                            name="celular"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Celular</FieldLabel>
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
                            control={clientForm.control}
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
                            control={clientForm.control}
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

                        <div className="sm:col-span-2">
                            <Controller
                                control={clientForm.control}
                                name="logradouro"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Logradouro</FieldLabel>
                                        <Input {...field} aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>

                        <Controller
                            control={clientForm.control}
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
                            control={clientForm.control}
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
                            control={clientForm.control}
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
                            control={clientForm.control}
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
                            control={clientForm.control}
                            name="estado"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Estado</FieldLabel>
                                    <Input {...field} placeholder="SP" maxLength={2} aria-invalid={fieldState.invalid} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />

                        <div className="sm:col-span-2">
                            <Controller
                                control={clientForm.control}
                                name="observacoes"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Observações</FieldLabel>
                                        <Input {...field} aria-invalid={fieldState.invalid} />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>

                    <div className="flex justify-end">
                        <Button type="submit" className="cursor-pointer bg-[#2A64E8] hover:bg-[#2A64E8]" disabled={clientForm.formState.isSubmitting}>
                            Cadastrar cliente
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
