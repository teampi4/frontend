import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
import type { Usuario } from "@/app/features/usuarios/types";
import type { PerfilUsuario } from "@/app/features/usuarios/types";

const usuarioSchema = z.object({
  login: z.string().min(1, "Informe o login."),
  nome: z.string().min(1, "Informe o nome."),
  perfil: z.enum(["admin", "gerente", "operador", "vendedor"], { required_error: "Selecione o perfil." }),
  senha: z.string().optional(),
});

type UsuarioFormValues = z.infer<typeof usuarioSchema> & { ativo?: boolean };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idEmpresa: string | null;
  editingUsuario: Usuario | null;
  onSubmit: (values: UsuarioFormValues) => Promise<void>;
};

const PERFIS: { value: PerfilUsuario; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "gerente", label: "Gerente" },
  { value: "operador", label: "Operador" },
  { value: "vendedor", label: "Vendedor" },
];

const defaultValues: UsuarioFormValues = {
  login: "",
  nome: "",
  perfil: "operador",
  senha: "",
  ativo: true,
};

export const UsuarioDialog = ({
  open,
  onOpenChange,
  editingUsuario,
  onSubmit,
}: Props) => {
  const isEdit = !!editingUsuario;

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && editingUsuario) {
      form.reset({
        login: editingUsuario.login ?? "",
        nome: editingUsuario.nome ?? "",
        perfil: editingUsuario.perfil ?? "operador",
        senha: "",
        ativo: editingUsuario.ativo ?? true,
      });
    } else if (open && !editingUsuario) {
      form.reset(defaultValues);
    }
  }, [open, editingUsuario, form]);

  const handleSubmit = async (values: UsuarioFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Altere os dados do usuário vinculado à empresa." : "Preencha os dados do novo usuário."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Controller
                control={form.control}
                name="login"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Login</FieldLabel>
                    <Input {...field} disabled={isEdit} aria-invalid={fieldState.invalid} />
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
                    {PERFIS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
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
                  <FieldLabel>Senha {isEdit && "(deixe em branco para não alterar)"}</FieldLabel>
                  <Input type="password" {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
