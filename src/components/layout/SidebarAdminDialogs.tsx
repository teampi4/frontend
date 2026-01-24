import { Controller, type UseFormReturn } from "react-hook-form";
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
import type { CompanyValues, UserValues } from "@/components/layout/sidebar-admin-dialogs.schema";

type SidebarAdminDialogsProps = {
    isCompanyDialogOpen: boolean;
    isUserDialogOpen: boolean;
    onCompanyDialogChange: (open: boolean) => void;
    onUserDialogChange: (open: boolean) => void;
    companyForm: UseFormReturn<CompanyValues>;
    userForm: UseFormReturn<UserValues>;
    companies: Array<{ id: string; nome_fantasia: string; razao_social: string }>;
    companiesLoading: boolean;
    onSubmitCompany: (values: CompanyValues) => void | Promise<void>;
    onSubmitUser: (values: UserValues) => void | Promise<void>;
    formatCnpj: (value: string) => string;
    formatTelefone: (value: string) => string;
    formatCep: (value: string) => string;
};

export const SidebarAdminDialogs = ({
    isCompanyDialogOpen,
    isUserDialogOpen,
    onCompanyDialogChange,
    onUserDialogChange,
    companyForm,
    userForm,
    companies,
    companiesLoading,
    onSubmitCompany,
    onSubmitUser,
    formatCnpj,
    formatTelefone,
    formatCep,
}: SidebarAdminDialogsProps) => (
    <>
        <Dialog open={isCompanyDialogOpen} onOpenChange={onCompanyDialogChange}>
            <DialogContent className="h-[90vh] max-h-[90vh] overflow-y-auto sm:w-[600px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar empresa</DialogTitle>
                    <DialogDescription>
                        Informe os dados da empresa.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-6"
                    onSubmit={companyForm.handleSubmit(onSubmitCompany)}
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
                                    <Input {...field} aria-invalid={fieldState.invalid} type="number" />
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
                        <Button type="button" variant="outline" onClick={() => onCompanyDialogChange(false)}>
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

        <Dialog open={isUserDialogOpen} onOpenChange={onUserDialogChange}>
            <DialogContent className="sm:w-[520px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar usuário</DialogTitle>
                    <DialogDescription>
                        Informe os dados do usuário.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-6"
                    onSubmit={userForm.handleSubmit(onSubmitUser)}
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
                                    <select
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        aria-invalid={fieldState.invalid}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                    <option value="" disabled>
                                        Selecione um perfil
                                    </option>
                                    <option value="gerente">gerente</option>
                                    <option value="operador">operador</option>
                                    <option value="vendedor">vendedor</option>
                                    </select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            control={userForm.control}
                            name="id_empresa"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Empresa</FieldLabel>
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
                        <Button type="button" variant="outline" onClick={() => onUserDialogChange(false)}>
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
);
