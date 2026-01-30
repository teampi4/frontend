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
import type { SaleUpdateFormValues } from "@/app/features/sales/sales.schema";
import type { Venda } from "@/app/features/sales/types";

type SalesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<SaleUpdateFormValues>;
  onSubmit: (values: SaleUpdateFormValues) => void | Promise<void>;
  editingSale?: Venda | null;
  clientes: Array<{ id: string; nome_fantasia?: string; razao_social?: string }>;
  formasPagamento: Array<{ id: string; tipo: string; descricao?: string }>;
  clientesLoading: boolean;
  formasLoading: boolean;
};

const STATUS_VENDA = [
  { value: "orcamento", label: "Orçamento" },
  { value: "confirmada", label: "Confirmada" },
  { value: "faturada", label: "Faturada" },
  { value: "cancelada", label: "Cancelada" },
];

const formatCurrencyInput = (value: number | undefined): string => {
  const num = typeof value === "number" && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
};

const parseCurrencyInput = (value: string): number => {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return 0;
  return parseInt(digits, 10) / 100;
};

export const SalesDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  editingSale,
  clientes,
  formasPagamento,
  clientesLoading,
  formasLoading,
}: SalesDialogProps) => {
  const isEdit = !!editingSale;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[520px] gap-6">
        <DialogHeader className="space-y-2">
          <DialogTitle>{isEdit ? "Editar venda" : "Nova venda"}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {isEdit
              ? "Atualize os dados da venda."
              : "A criação de vendas está em desenvolvimento. Use a edição para alterar vendas existentes."}
          </DialogDescription>
        </DialogHeader>

        {isEdit && (
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="numero_venda"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Número da venda</FieldLabel>
                    <Input {...field} placeholder="VND-2025-0001" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="data_venda"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Data da venda</FieldLabel>
                    <Input
                      {...field}
                      type="datetime-local"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      aria-invalid={fieldState.invalid}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {STATUS_VENDA.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="parcelas"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Parcelas</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <div className="sm:col-span-2">
                <Controller
                  control={form.control}
                  name="id_cliente"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Cliente</FieldLabel>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        disabled={clientesLoading}
                        aria-invalid={fieldState.invalid}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">
                          {clientesLoading ? "Carregando..." : "Selecione o cliente"}
                        </option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome_fantasia || c.razao_social || c.id}
                          </option>
                        ))}
                      </select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Controller
                  control={form.control}
                  name="id_forma_pagamento"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Forma de pagamento</FieldLabel>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        disabled={formasLoading}
                        aria-invalid={fieldState.invalid}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">
                          {formasLoading ? "Carregando..." : "Selecione a forma de pagamento"}
                        </option>
                        {formasPagamento.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.descricao || f.tipo}
                          </option>
                        ))}
                      </select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={form.control}
                name="desconto"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Desconto (R$)</FieldLabel>
                    <Input
                      ref={field.ref}
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={formatCurrencyInput(field.value)}
                      onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <div className="sm:col-span-2">
                <Controller
                  control={form.control}
                  name="observacoes"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Observações (opcional)</FieldLabel>
                      <Input {...field} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            <DialogFooter className="gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]"
                disabled={form.formState.isSubmitting}
              >
                Salvar alterações
              </Button>
            </DialogFooter>
          </form>
        )}

        {!isEdit && (
          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
