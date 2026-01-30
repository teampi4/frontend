import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { clientSchema, type ClientValues } from "@/components/layout/sidebar-admin-dialogs.schema";
import type { Cliente } from "@/app/features/clientes/types";

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
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmpresa: string;
  editingCliente: Cliente | null;
  onSubmit: (values: ClientValues) => Promise<void>;
};

const defaultValues: ClientValues = {
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
};

export const ClienteDialog = ({
  open,
  onOpenChange,
  idEmpresa,
  editingCliente,
  onSubmit,
}: Props) => {
  const form = useForm<ClientValues>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && editingCliente) {
      form.reset({
        tipo_pessoa: (editingCliente.tipo_pessoa as "PF" | "PJ") ?? "PF",
        cpf_cnpj: editingCliente.cpf_cnpj ?? "",
        razao_social: editingCliente.razao_social ?? "",
        nome_fantasia: editingCliente.nome_fantasia ?? "",
        contato_nome: editingCliente.contato_nome ?? "",
        telefone: editingCliente.telefone ?? "",
        celular: editingCliente.celular ?? "",
        email: editingCliente.email ?? "",
        cep: editingCliente.cep ?? "",
        logradouro: editingCliente.logradouro ?? "",
        numero: editingCliente.numero ?? "",
        complemento: editingCliente.complemento ?? "",
        bairro: editingCliente.bairro ?? "",
        cidade: editingCliente.cidade ?? "",
        estado: editingCliente.estado ?? "",
        observacoes: editingCliente.observacoes ?? "",
        ativo: editingCliente.ativo ?? true,
      });
    } else if (open && !editingCliente) {
      form.reset(defaultValues);
    }
  }, [open, editingCliente, form]);

  const handleSubmit = async (values: ClientValues) => {
    await onSubmit({
      ...values,
      tipo_pessoa: values.tipo_pessoa as "PF" | "PJ",
      id_empresa: idEmpresa,
    } as ClientValues & { id_empresa: string });
    onOpenChange(false);
  };

  const isEdit = !!editingCliente;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Altere os dados do cliente." : "Preencha os dados do cliente vinculado à empresa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="tipo_pessoa"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Tipo</FieldLabel>
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    disabled={isEdit}
                  >
                    <option value="PF">PF</option>
                    <option value="PJ">PJ</option>
                  </select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="cpf_cnpj"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>CPF/CNPJ</FieldLabel>
                  <Input
                    {...field}
                    maxLength={18}
                    disabled={isEdit}
                    onChange={(e) => field.onChange(formatCpfCnpj(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="sm:col-span-2">
              <Controller
                control={form.control}
                name="contato_nome"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Nome do contato</FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input {...field} onChange={(e) => field.onChange(formatTelefone(e.target.value))} maxLength={15} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="celular"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Celular</FieldLabel>
                  <Input {...field} onChange={(e) => field.onChange(formatTelefone(e.target.value))} maxLength={15} />
                </Field>
              )}
            />
            <div className="sm:col-span-2">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>E-mail</FieldLabel>
                    <Input type="email" {...field} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <Controller
              control={form.control}
              name="cep"
              render={({ field }) => (
                <Field>
                  <FieldLabel>CEP</FieldLabel>
                  <Input {...field} onChange={(e) => field.onChange(formatCep(e.target.value))} maxLength={9} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="logradouro"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Logradouro</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="numero"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Número</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Bairro</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Cidade</FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="estado"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Estado</FieldLabel>
                  <Input {...field} placeholder="UF" maxLength={2} />
                </Field>
              )}
            />
            {isEdit && (
              <div className="sm:col-span-2 flex items-center gap-2">
                <Controller
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        id={field.name}
                        name={field.name}
                        type="checkbox"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Ativo
                    </label>
                  )}
                />
              </div>
            )}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : isEdit ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
