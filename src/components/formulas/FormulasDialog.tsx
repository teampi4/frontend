import { useMemo } from "react";
import { Controller, useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { Plus, Trash2, Calculator, AlertCircle } from "lucide-react";
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
import type { FormulaFormValues } from "@/app/features/formulas/formulas.schema"; // Ajuste o caminho se necessário
import type { ProdutoSelect, InsumoSelect } from "@/app/features/formulas/types"; // Ajuste o caminho se necessário

type FormulasDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<FormulaFormValues>;
  onSubmit: (values: FormulaFormValues) => void | Promise<void>;
  isEdit: boolean;
  listaProdutos: ProdutoSelect[];
  listaInsumos: InsumoSelect[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export const FormulasDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  isEdit,
  listaProdutos,
  listaInsumos,
}: FormulasDialogProps) => {
  const { control, handleSubmit, formState: { isSubmitting, errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredientes",
  });

  // --- CÁLCULO DINÂMICO DE CUSTO ---
  // Observa todas as mudanças no array de ingredientes
  const ingredientesValues = useWatch({
    control,
    name: "ingredientes",
  });

  const custoTotalEstimado = useMemo(() => {
    if (!ingredientesValues) return 0;

    return ingredientesValues.reduce((acc, item) => {
      // Busca o insumo na lista completa para pegar o preço atual
      const insumo = listaInsumos.find((i) => String(i.id) === String(item.id_estoque_insumo));
      const custoUnitario = insumo ? Number(insumo.custo_unitario) : 0;
      const quantidade = Number(item.quantidade_necessaria) || 0;

      return acc + (custoUnitario * quantidade);
    }, 0);
  }, [ingredientesValues, listaInsumos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] gap-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 border-b border-slate-100 pb-4">
          <DialogTitle>{isEdit ? "Editar Fórmula" : "Nova Fórmula"}</DialogTitle>
          <DialogDescription className="text-slate-500">
            {isEdit
              ? "Altere a composição deste produto. Cada ingrediente é salvo como um registro separado."
              : "Selecione o produto e defina quanto de cada insumo consumir por unidade. A fórmula só diz o que consumir na produção."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* SELEÇÃO DO PRODUTO */}
          <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Produto (Produção / estoque_producao)
              </label>
              {listaProdutos.length === 0 ? (
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    Nenhum produto cadastrado em Produção. Cadastre em <strong>Produção</strong> (estoque_producao) e depois defina a fórmula aqui.
                  </span>
                </div>
              ) : (
                <>
                  <Controller
                    control={control}
                    name="id_estoque_producao"
                    render={({ field }) => (
                      <select
                        {...field}
                        disabled={isEdit}
                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                      >
                        <option value="">Selecione o produto...</option>
                        {listaProdutos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.unidade_medida})
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.id_estoque_producao && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3"/> Selecione um produto
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* LISTA DE INGREDIENTES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-slate-500" /> Composição (Ingredientes)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id_estoque_insumo: "", quantidade_necessaria: 0, observacao: "" })}
                className="h-8 border-dashed border-slate-300 hover:border-slate-400 text-slate-600"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Ingrediente
              </Button>
            </div>

            <div className="space-y-2">
              {/* CABEÇALHO DA TABELA INTERNA */}
              {fields.length > 0 && (
                <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-slate-500 bg-slate-50 rounded-t-md border-b border-slate-200">
                  <div className="col-span-5">INSUMO</div>
                  <div className="col-span-3">QUANTIDADE</div>
                  <div className="col-span-3">OBSERVAÇÃO</div>
                  <div className="col-span-1 text-center">AÇÃO</div>
                </div>
              )}

              {fields.map((fieldItem, index) => (
                <div key={fieldItem.id} className="grid grid-cols-12 gap-3 items-center bg-white p-2 border border-slate-200 rounded-md hover:border-slate-300 transition-colors">
                  
                  {/* Select Insumo */}
                  <div className="col-span-5">
                    <Controller
                      control={control}
                      name={`ingredientes.${index}.id_estoque_insumo`}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="flex h-9 w-full rounded border border-slate-300 bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          <option value="">Selecione...</option>
                          {listaInsumos.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.nome} ({i.unidade_medida}) - Custo: {formatCurrency(i.custo_unitario)}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Input Quantidade */}
                  <div className="col-span-3">
                    <Controller
                      control={control}
                      name={`ingredientes.${index}.quantidade_necessaria`}
                      render={({ field }) => (
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="0.000"
                            className="h-9 text-right pr-2"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)} // Mantém string no input pra facilitar digitação
                            onBlur={(e) => field.onChange(parseFloat(e.target.value) || 0)} // Converte ao sair
                          />
                        </div>
                      )}
                    />
                  </div>

                  {/* Input Observação */}
                  <div className="col-span-3">
                    <Controller
                      control={control}
                      name={`ingredientes.${index}.observacao`}
                      render={({ field }) => (
                        <Input {...field} placeholder="Ex: Peneirar" className="h-9 text-xs" />
                      )}
                    />
                  </div>

                  {/* Botão Remover */}
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                 <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                    Nenhum ingrediente adicionado.
                 </div>
              )}
            </div>
            {errors.ingredientes && <p className="text-xs text-red-500 mt-1">Adicione pelo menos um ingrediente válido.</p>}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between border-t pt-4 bg-slate-50/50 -mx-6 px-6 -mb-6 pb-6 mt-6 rounded-b-lg">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Custo Estimado</span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(custoTotalEstimado)}
              </span>
            </div>
            <div className="flex gap-3">
               <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                 Cancelar
               </Button>
               <Button type="submit" variant="default" disabled={isSubmitting} className="min-w-[120px]">
                 {isSubmitting ? "Salvando..." : "Salvar"}
               </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};