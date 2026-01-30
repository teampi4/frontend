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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { ProductFormValues } from "@/app/features/products/products.schema";
import type { EstoqueProduto } from "@/app/features/products/types";

type ProductsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  editingProduct?: EstoqueProduto | null;
};

const UNIDADES_MEDIDA = ["UN", "KG", "L", "ML", "G", "CX", "PCT", "M", "M²"];

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

export const ProductsDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  editingProduct,
}: ProductsDialogProps) => {
  const isEdit = !!editingProduct;

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:w-[520px] gap-6">
      <DialogHeader className="space-y-2">
        <DialogTitle>{isEdit ? "Editar produto" : "Cadastrar produto"}</DialogTitle>
        <DialogDescription className="leading-relaxed">
          {isEdit ? "Atualize os dados do produto." : "Informe os dados do produto."}
        </DialogDescription>
      </DialogHeader>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {Object.keys(form.formState.errors).length > 0 && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <ul className="list-disc list-inside space-y-0.5">
              {Object.entries(form.formState.errors).map(([key, err]) => (
                <li key={key}>{err?.message}</li>
              ))}
            </ul>
          </div>
        )}

        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={form.control}
            name="codigo"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Código</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Ex: SUCO-LAR-1KG"
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="nome"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Ex: Suco de Laranja em Pó - 1kg"
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="unidade_medida"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Unidade de medida</FieldLabel>
                <select
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    Selecione a unidade
                  </option>
                  {UNIDADES_MEDIDA.map((un) => (
                    <option key={un} value={un}>
                      {un}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="custo_producao"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Custo de produção</FieldLabel>
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
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="preco_venda"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Preço de venda</FieldLabel>
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
              </Field>
            )}
          />
          <div className="sm:col-span-2">
            <Controller
              control={form.control}
              name="descricao"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Descrição (opcional)</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Ex: Suco de laranja em pó, rende 10 litros"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />
          </div>
          {isEdit && (
            <div className="sm:col-span-2">
              <Controller
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <Field>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        id={field.name}
                        name={field.name}
                        type="checkbox"
                        checked={field.value ?? true}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        className="rounded border-input"
                      />
                      <span className="text-sm">Produto ativo</span>
                    </label>
                  </Field>
                )}
              />
            </div>
          )}
        </FieldGroup>

        <DialogFooter className="gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]"
            disabled={form.formState.isSubmitting}
          >
            {isEdit ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  );
};
