import { useCallback, useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import type { SaleUpdateFormValues } from "@/app/features/sales/sales.schema";
import type { VendaWithItens, ItemVendaRead } from "@/app/features/sales/types";
import { itemVendaApi } from "@/app/features/sales/api/sales.api";
import { productsApi } from "@/app/features/products/api/products.api";
import { productItemsApi } from "@/app/features/product-items/api/product-items.api";
import type { EstoqueProduto } from "@/app/features/products/types";
import type { ItemEstoqueProduto } from "@/app/features/product-items/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

type SalesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<SaleUpdateFormValues>;
  onSubmit: (values: SaleUpdateFormValues) => void | Promise<void>;
  editingSale?: VendaWithItens | null;
  clientes: Array<{ id: string; nome_fantasia?: string; razao_social?: string }>;
  clientesLoading: boolean;
  formasPagamento: Array<{ id: string; tipo: string; descricao?: string }>;
  formasLoading: boolean;
  idEmpresa: string;
  idUsuario: string;
  onItensUpdated?: () => void;
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const SalesDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  editingSale,
  clientes,
  clientesLoading,
  formasPagamento,
  formasLoading,
  idEmpresa,
  idUsuario,
  onItensUpdated,
}: SalesDialogProps) => {
  const isEdit = !!editingSale;
  const [localItens, setLocalItens] = useState<ItemVendaRead[]>([]);
  const [produtos, setProdutos] = useState<EstoqueProduto[]>([]);
  const [itensEstoqueMap, setItensEstoqueMap] = useState<Record<string, ItemEstoqueProduto[]>>({});
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingLotes, setLoadingLotes] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editPreco, setEditPreco] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [newItemProduto, setNewItemProduto] = useState("");
  const [newItemLote, setNewItemLote] = useState("");
  const [newItemQty, setNewItemQty] = useState("1");
  const [newItemPreco, setNewItemPreco] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && editingSale?.itens) {
      setLocalItens(editingSale.itens);
      setEditingItemId(null);
      setAddingItem(false);
    }
  }, [open, editingSale?.id, editingSale?.itens]);

  const loadProdutos = useCallback(async () => {
    if (!idEmpresa) return;
    try {
      setLoadingProdutos(true);
      const { data } = await productsApi.listByEmpresa(idEmpresa);
      setProdutos(data ?? []);
    } catch {
      setProdutos([]);
    } finally {
      setLoadingProdutos(false);
    }
  }, [idEmpresa]);

  const loadLotes = useCallback(async (idEstoqueProduto: string) => {
    try {
      setLoadingLotes(idEstoqueProduto);
      const { data } = await productItemsApi.listByEstoqueProduto(idEstoqueProduto);
      setItensEstoqueMap((prev) => ({ ...prev, [idEstoqueProduto]: data ?? [] }));
    } catch {
      setItensEstoqueMap((prev) => ({ ...prev, [idEstoqueProduto]: [] }));
    } finally {
      setLoadingLotes(null);
    }
  }, []);

  useEffect(() => {
    if (open && isEdit && idEmpresa) loadProdutos();
  }, [open, isEdit, idEmpresa, loadProdutos]);

  const handleStartEditItem = (item: ItemVendaRead) => {
    setEditingItemId(item.id);
    setEditQty(String(item.quantidade));
    setEditPreco(String(item.preco_unitario));
  };

  const handleSaveEditItem = async () => {
    if (!editingItemId) return;
    const qty = parseFloat(editQty);
    const preco = parseFloat(editPreco);
    if (isNaN(qty) || qty <= 0 || isNaN(preco) || preco < 0) {
      toast.error("Quantidade e preço inválidos.");
      return;
    }
    try {
      setSaving(true);
      await itemVendaApi.update(editingItemId, {
        quantidade: qty,
        preco_unitario: preco,
        valor_total: qty * preco,
      });
      setLocalItens((prev) =>
        prev.map((i) =>
          i.id === editingItemId
            ? { ...i, quantidade: qty, preco_unitario: preco, valor_total: qty * preco }
            : i
        )
      );
      setEditingItemId(null);
      onItensUpdated?.();
      toast.success("Item atualizado.");
    } catch {
      toast.error("Não foi possível atualizar o item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setSaving(true);
      await itemVendaApi.delete(id);
      setLocalItens((prev) => prev.filter((i) => i.id !== id));
      onItensUpdated?.();
      toast.success("Item removido.");
    } catch {
      toast.error("Não foi possível remover o item.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!editingSale?.id || !newItemLote) {
      toast.error("Selecione produto e lote.");
      return;
    }
    const qty = parseFloat(newItemQty);
    const preco = parseFloat(newItemPreco);
    if (isNaN(qty) || qty <= 0 || isNaN(preco) || preco < 0) {
      toast.error("Quantidade e preço inválidos.");
      return;
    }
    if (newItemProduto) {
      const lotes = itensEstoqueMap[newItemProduto] ?? [];
      const lote = lotes.find((l) => l.id === newItemLote);
      if (lote) {
        const disponivel = lote.quantidade - lote.quantidade_reservada;
        if (qty > disponivel) {
          toast.error(`A quantidade informada (${qty}) é maior que a disponível no lote (${disponivel}).`);
          return;
        }
      }
    }
    try {
      setSaving(true);
      const { data } = await itemVendaApi.create({
        id_venda: editingSale.id,
        id_item_estoque_produto: newItemLote,
        quantidade: qty,
        preco_unitario: preco,
      });
      if (data) {
        const { data: estoqueItem } = await productItemsApi.getById(newItemLote);
        if (estoqueItem) {
          const novaQuantidade = Math.max(0, estoqueItem.quantidade - qty);
          await productItemsApi.update(newItemLote, {
            quantidade: novaQuantidade,
          });
          await movimentacoesApi.create({
            id_empresa: idEmpresa,
            id_usuario: idUsuario,
            tipo_estoque: "produto",
            tipo_operacao: "saida",
            quantidade: qty,
            id_item_estoque_produto: newItemLote,
            motivo: "Venda",
            observacoes: editingSale.numero_venda ? `Venda ${editingSale.numero_venda}` : null,
          });
        }
        setLocalItens((prev) => [...prev, data]);
        setNewItemProduto("");
        setNewItemLote("");
        setNewItemQty("1");
        setNewItemPreco("0");
        setAddingItem(false);
        onItensUpdated?.();
        toast.success("Item adicionado.");
      }
    } catch {
      toast.error("Não foi possível adicionar o item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[520px] max-h-[90vh] flex flex-col overflow-hidden p-4 sm:p-6 gap-0">
        <DialogHeader className="space-y-2 shrink-0 pb-4">
          <DialogTitle>{isEdit ? "Editar venda" : "Nova venda"}</DialogTitle>
          <DialogDescription className="leading-relaxed">
            {isEdit
              ? "Atualize os dados da venda."
              : "A criação de vendas está em desenvolvimento. Use a edição para alterar vendas existentes."}
          </DialogDescription>
        </DialogHeader>

        {isEdit && (
          <form className="flex flex-col min-h-0 flex-1 overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="overflow-y-auto overflow-x-hidden min-h-0 flex-1 space-y-6 pr-1 pb-4 max-h-[60vh]">
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
                      <Input
                        {...field}
                        placeholder="Ex.: forma de pagamento (PIX, cartão à vista, boleto, transferência, dinheiro...), outras observações da venda"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>

            {editingSale && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">Itens da venda</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddingItem((p) => !p)}
                    disabled={saving || loadingProdutos}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar item
                  </Button>
                </div>
                <div className="overflow-x-auto rounded border border-slate-200 bg-white text-sm">
                  <table className="min-w-full">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Qtd</th>
                        <th className="py-2 px-3">Preço unit.</th>
                        <th className="py-2 px-3">Desconto</th>
                        <th className="py-2 px-3">Valor total</th>
                        <th className="py-2 px-3 w-24">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {localItens.map((item) => (
                        <tr key={item.id}>
                          {editingItemId === item.id ? (
                            <>
                              <td className="py-2 px-3">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  className="h-8 w-20"
                                  value={editQty}
                                  onChange={(e) => setEditQty(e.target.value)}
                                />
                              </td>
                              <td className="py-2 px-3">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="h-8 w-24"
                                  value={editPreco}
                                  onChange={(e) => setEditPreco(e.target.value)}
                                />
                              </td>
                              <td className="py-2 px-3">{formatCurrency(item.desconto)}</td>
                              <td className="py-2 px-3">{formatCurrency(parseFloat(editQty || "0") * parseFloat(editPreco || "0"))}</td>
                              <td className="py-2 px-3">
                                <Button type="button" size="sm" variant="ghost" onClick={handleSaveEditItem} disabled={saving}>Salvar</Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setEditingItemId(null)}>Cancelar</Button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2 px-3">{item.quantidade}</td>
                              <td className="py-2 px-3">{formatCurrency(item.preco_unitario)}</td>
                              <td className="py-2 px-3">{formatCurrency(item.desconto)}</td>
                              <td className="py-2 px-3 font-medium">{formatCurrency(item.valor_total)}</td>
                              <td className="py-2 px-3">
                                <Button type="button" size="sm" variant="ghost" onClick={() => handleStartEditItem(item)} disabled={saving} title="Editar"><Pencil className="h-4 w-4" /></Button>
                                <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteItem(item.id)} disabled={saving} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {localItens.length === 0 && !addingItem && (
                  <p className="text-sm text-slate-500">Nenhum item nesta venda.</p>
                )}
                {addingItem && (
                  <div className="flex flex-wrap gap-2 items-end p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="min-w-[140px]">
                      <label className="block text-xs text-slate-500 mb-1">Produto</label>
                      <select
                        value={newItemProduto}
                        onChange={(e) => {
                          setNewItemProduto(e.target.value);
                          setNewItemLote("");
                          if (e.target.value) loadLotes(e.target.value);
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      >
                        <option value="">Selecione</option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[120px]">
                      <label className="block text-xs text-slate-500 mb-1">Lote</label>
                      <select
                        value={newItemLote}
                        onChange={(e) => {
                          const id = e.target.value;
                          setNewItemLote(id);
                          if (newItemProduto && id) {
                            const lotes = itensEstoqueMap[newItemProduto] ?? [];
                            const lote = lotes.find((l) => l.id === id);
                            const disp = lote ? lote.quantidade - lote.quantidade_reservada : 0;
                            const q = parseFloat(newItemQty);
                            if (!isNaN(q) && q > disp) setNewItemQty(String(Math.max(0, disp)));
                          }
                        }}
                        disabled={!newItemProduto || loadingLotes === newItemProduto}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      >
                        <option value="">{loadingLotes ? "Carregando..." : "Selecione"}</option>
                        {(newItemProduto ? itensEstoqueMap[newItemProduto] ?? [] : []).map((ie) => (
                          <option key={ie.id} value={ie.id}>{ie.lote} (disp: {ie.quantidade - ie.quantidade_reservada})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Qtd {(() => {
                          if (!newItemLote || !newItemProduto) return "";
                          const lotes = itensEstoqueMap[newItemProduto] ?? [];
                          const lote = lotes.find((l) => l.id === newItemLote);
                          const disp = lote ? lote.quantidade - lote.quantidade_reservada : null;
                          return disp != null && disp >= 0 ? `(máx. ${disp})` : "";
                        })()}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={(() => {
                          if (!newItemLote || !newItemProduto) return undefined;
                          const lotes = itensEstoqueMap[newItemProduto] ?? [];
                          const lote = lotes.find((l) => l.id === newItemLote);
                          const disp = lote ? lote.quantidade - lote.quantidade_reservada : undefined;
                          return disp != null && disp >= 0 ? disp : undefined;
                        })()}
                        className="h-9 w-20"
                        value={newItemQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!newItemLote || !newItemProduto) {
                            setNewItemQty(val);
                            return;
                          }
                          const lotes = itensEstoqueMap[newItemProduto] ?? [];
                          const lote = lotes.find((l) => l.id === newItemLote);
                          const disp = lote ? lote.quantidade - lote.quantidade_reservada : undefined;
                          const num = parseFloat(val);
                          if (disp != null && disp >= 0 && !isNaN(num) && num > disp) {
                            setNewItemQty(String(disp));
                            return;
                          }
                          setNewItemQty(val);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Preço (R$)</label>
                      <Input type="number" step="0.01" min="0" className="h-9 w-24" value={newItemPreco} onChange={(e) => setNewItemPreco(e.target.value)} />
                    </div>
                    <Button type="button" size="sm" onClick={handleAddItem} disabled={saving}>Adicionar</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setAddingItem(false)}>Cancelar</Button>
                  </div>
                )}
                {localItens.length > 0 && (
                  <p className="text-sm text-slate-600">
                    <strong>Subtotal itens:</strong> {formatCurrency(localItens.reduce((s, i) => s + i.valor_total, 0))}
                  </p>
                )}
              </div>
            )}
            </div>
            <DialogFooter className="gap-3 pt-4 shrink-0 border-t border-slate-200 mt-4">
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
