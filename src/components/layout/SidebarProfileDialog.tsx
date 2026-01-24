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

export type ProfileFormValues = {
    login: string;
    nome: string;
    senha: string;
};

type SidebarProfileDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<ProfileFormValues>;
    onSubmit: (values: ProfileFormValues) => void | Promise<void>;
};

export const SidebarProfileDialog = ({
    open,
    onOpenChange,
    form,
    onSubmit,
}: SidebarProfileDialogProps) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:w-[520px]">
            <DialogHeader>
                <DialogTitle>Editar perfil</DialogTitle>
                <DialogDescription>
                    Atualize seus dados de acesso.
                </DialogDescription>
            </DialogHeader>

            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <div className="sm:col-span-2">
                        <Controller
                            control={form.control}
                            name="senha"
                            render={({ field, fieldState }) => (
                                <Field>
                                    <FieldLabel>Senha (opcional)</FieldLabel>
                                    <Input type="password" {...field} aria-invalid={fieldState.invalid} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                    </div>
                </FieldGroup>

                <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="cursor-pointer bg-[#2A64E8] hover:bg-[#2A64E8]" disabled={form.formState.isSubmitting}>
                        Salvar alterações
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
);
