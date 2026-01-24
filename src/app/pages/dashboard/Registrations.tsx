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

const registrationSchema = z.object({
    login: z.string().min(1, "Informe o login."),
    nome: z.string().min(1, "Informe o nome."),
    perfil: z.enum(["operador", "vendedor"], {
        required_error: "Selecione o perfil.",
    }),
    senha: z.string().min(3, "A senha deve ter pelo menos 3 caracteres."),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

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

    if (!isManager) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
                Acesso restrito. Apenas gerentes podem cadastrar novos usuários.
            </div>
        );
    }

    return (
        <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
    );
};
