import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { productItemsApi } from "@/app/features/product-items/api/product-items.api";
import type { ItemEstoqueInsumo } from "@/app/features/product-items/types";

// --- Helpers de Formatação ---
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

// --- Schema de Validação (Zod) ---
const itemSchema = z.object({
  lote: z.string().min(1, "O lote é obrigatório."),
  data_entrada: z.string().min(1, "A data de entrada é obrigatória."),
  data_validade: z.string().nullable().optional(), // Pode ser vazio
  quantidade: z.coerce.number().min(0, "A quantidade não pode ser negativa."),
  quantidade_minima: z.coerce.number().min(0).default(0),
  custo_unitario: z.number().min(0, "O custo não pode ser negativo."),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
  idEstoqueInsumo: string;
  editingItem?: ItemEstoqueInsumo | null;
};

// Helper para data input (YYYY-MM-DD)
const formatDateForInput = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export const InventoryInsumoItemDialog = ({
  open,
  onOpenChange,
  onSuccess,
  idEstoqueInsumo,
  editingItem,
}: Props) => {
  const isEdit = !!editingItem;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      lote: "",
      data_entrada: new Date().toISOString().split("T")[0],
      data_validade: "",
      quantidade: 0,
      quantidade_minima: 0,
      custo_unitario: 0,
      localizacao: "",
      observacoes: "",
    },
  });

  // Reseta o formulário ao abrir ou trocar de item
  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.reset({
          lote: editingItem.lote,
          data_entrada: formatDateForInput(editingItem.data_entrada),
          data_validade: formatDateForInput(editingItem.data_validade),
          quantidade: editingItem.quantidade,
          quantidade_minima: editingItem.quantidade_minima ?? 0,
          custo_unitario: editingItem.custo_unitario,
          localizacao: editingItem.localizacao ?? "",
          observacoes: editingItem.observacoes ?? "",
        });
      } else {
        form.reset({
          lote: "",
          data_entrada: new Date().toISOString().split("T")[0],
          data_validade: "",
          quantidade: 0,
          quantidade_minima: 0,
          custo_unitario: 0,
          localizacao: "",
          observacoes: "",
        });
      }
    }
  }, [open, editingItem, form]);

  const onSubmit = async (values: ItemFormValues) => {
    try {
      const payloadCommon = {
        lote: values.lote,
        // Adiciona hora fixa para evitar problemas de timezone na API se for DateTime
        data_entrada: `${values.data_entrada}T00:00:00`,
        data_validade: values.data_validade ? `${values.data_validade}T00:00:00` : null,
        quantidade: values.quantidade,
        quantidade_minima: values.quantidade_minima,
        custo_unitario: values.custo_unitario,
        localizacao: values.localizacao || null,
        observacoes: values.observacoes || null,
      };

      if (isEdit && editingItem) {
        await productItemsApi.updateInsumo(editingItem.id, payloadCommon);
        toast.success("Lote atualizado com sucesso!");
      } else {
        await productItemsApi.createInsumo({
          id_estoque_insumo: idEstoqueInsumo,
          ...payloadCommon,
        });
        toast.success("Lote criado com sucesso!");
      }

      await onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar o lote. Verifique os dados.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar lote de insumo" : "Novo lote de insumo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Atualize as informações do lote." : "Cadastre a entrada de um novo lote no estoque."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
               <ul className="list-disc list-inside">
                 {Object.values(form.formState.errors).map((err, idx) => (
                   <li key={idx}>{err.message}</li>
                 ))}
               </ul>
            </div>
          )}

          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Lote */}
            <Controller
              control={form.control}
              name="lote"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Lote</FieldLabel>
                  <Input {...field} placeholder="Ex: LOTE-001" aria-invalid={fieldState.invalid} />
                </Field>
              )}
            />

            {/* Data Entrada */}
            <Controller
              control={form.control}
              name="data_entrada"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Data de entrada</FieldLabel>
                  <Input type="date" {...field} aria-invalid={fieldState.invalid} />
                </Field>
              )}
            />

            {/* Quantidade */}
            <Controller
              control={form.control}
              name="quantidade"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Quantidade Atual</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />

             {/* Custo Unitário (Formatado) */}
            <Controller
              control={form.control}
              name="custo_unitario"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Custo Unitário (R$)</FieldLabel>
                  <Input
                    value={formatCurrencyInput(field.value)}
                    onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />

            {/* Quantidade Mínima */}
            <Controller
              control={form.control}
              name="quantidade_minima"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Quantidade Mínima</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />

            {/* Validade */}
            <Controller
              control={form.control}
              name="data_validade"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Validade (opcional)</FieldLabel>
                  <Input 
                    type="date" 
                    value={field.value || ""} 
                    onChange={field.onChange} 
                    aria-invalid={fieldState.invalid} 
                  />
                </Field>
              )}
            />

            {/* Localização */}
            <div className="sm:col-span-2">
              <Controller
                control={form.control}
                name="localizacao"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Localização Física (opcional)</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="Ex: Prateleira A, Nível 2" aria-invalid={fieldState.invalid} />
                  </Field>
                )}
              />
            </div>

            {/* Observações */}
            <div className="sm:col-span-2">
              <Controller
                control={form.control}
                name="observacoes"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Observações (opcional)</FieldLabel>
                    <Input {...field} value={field.value || ""} placeholder="Informações adicionais sobre este lote" aria-invalid={fieldState.invalid} />
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
              className="bg-[#2A64E8] hover:bg-[#1f4db3]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Salvando..." : (isEdit ? "Salvar alterações" : "Criar Lote")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};