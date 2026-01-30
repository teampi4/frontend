import { useCallback, useEffect, useState } from "react";
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
import { productsApi } from "@/app/features/products/api/products.api";
import { productItemsApi } from "@/app/features/product-items/api/product-items.api";
import { salesApi } from "@/app/features/sales/api/sales.api";
import { movimentacoesApi } from "@/app/features/movimentacoes/api/movimentacoes.api";
import type { EstoqueProduto } from "@/app/features/products/types";
import type { ItemEstoqueProduto } from "@/app/features/product-items/types";
import type { ItemVendaCreate, VendaCreate } from "@/app/features/sales/types";
import { Plus, Trash2 } from "lucide-react";

type CreateSaleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  idEmpresa: string;
  idUsuario: string;
  clientes: Array<{ id: string; nome_fantasia?: string; razao_social?: string }>;
  formasPagamento: Array<{ id: string; tipo: string; descricao?: string }>;
  clientesLoading: boolean;
};

type ItemForm = {
  id_estoque_produto: string;
  id_item_estoque_produto: string;
  quantidade: string;
};

const STATUS_VENDA = [
  { value: "orcamento", label: "Orçamento" },
  { value: "confirmada", label: "Confirmada" },
  { value: "faturada", label: "Faturada" },
  { value: "cancelada", label: "Cancelada" },
];

const formatDateTimeLocal = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const generateNumeroVenda = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `VND-${now.getFullYear()}-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Date.now().toString().slice(-4)}`;
};

const formatCurrencyInput = (value: number | string | undefined): string => {
  const num = typeof value === "number" && !isNaN(value)
    ? value
    : typeof value === "string"
      ? parseFloat(value) || 0
      : 0;
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

export const CreateSaleDialog = ({
  open,
  onOpenChange,
  onSuccess,
  idEmpresa,
  idUsuario,
  clientes,
  formasPagamento,
  clientesLoading,
}: CreateSaleDialogProps) => {
  const [numeroVenda, setNumeroVenda] = useState("");
  const [dataVenda, setDataVenda] = useState("");
  const [status, setStatus] = useState("confirmada");
  const [idCliente, setIdCliente] = useState("");
  const [idFormaPagamento, setIdFormaPagamento] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [desconto, setDesconto] = useState("0");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [produtos, setProdutos] = useState<EstoqueProduto[]>([]);
  const [itensEstoqueMap, setItensEstoqueMap] = useState<
    Record<string, ItemEstoqueProduto[]>
  >({});
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingItens, setLoadingItens] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadProdutos = useCallback(async () => {
    try {
      setLoadingProdutos(true);
      const { data } = await productsApi.listByEmpresa(idEmpresa);
      setProdutos(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setProdutos([]);
    } finally {
      setLoadingProdutos(false);
    }
  }, [idEmpresa]);

  useEffect(() => {
    if (open && idEmpresa) {
      loadProdutos();
      setNumeroVenda(generateNumeroVenda());
      setDataVenda(formatDateTimeLocal());
      if (formasPagamento.length > 0) {
        setIdFormaPagamento(formasPagamento[0].id);
      }
    }
  }, [open, idEmpresa, loadProdutos, formasPagamento]);

  const loadItensEstoque = useCallback(async (idEstoqueProduto: string) => {
    try {
      setLoadingItens(idEstoqueProduto);
      const { data } = await productItemsApi.listByEstoqueProduto(idEstoqueProduto);
      setItensEstoqueMap((prev) => ({
        ...prev,
        [idEstoqueProduto]: data ?? [],
      }));
    } catch (err) {
      console.error("Erro ao carregar itens:", err);
      setItensEstoqueMap((prev) => ({ ...prev, [idEstoqueProduto]: [] }));
    } finally {
      setLoadingItens(null);
    }
  }, []);

  const handleAddItem = () => {
    setItens((prev) => [
      ...prev,
      {
        id_estoque_produto: "",
        id_item_estoque_produto: "",
        quantidade: "1",
      },
    ]);
  };

  const getPrecoVenda = (idEstoqueProduto: string): number => {
    const p = produtos.find((x) => x.id === idEstoqueProduto);
    return p != null ? p.preco_venda : 0;
  };

  const handleRemoveItem = (index: number) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemProdutoChange = (index: number, idEstoque: string) => {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              id_estoque_produto: idEstoque,
              id_item_estoque_produto: "",
            }
          : item
      )
    );
    if (idEstoque) {
      loadItensEstoque(idEstoque);
    }
  };

  const handleItemLoteChange = (index: number, idItem: string, idEstoqueProduto: string) => {
    const lotes = itensEstoqueMap[idEstoqueProduto] ?? [];
    const lote = lotes.find((l) => l.id === idItem);
    const disponivel = lote ? lote.quantidade - lote.quantidade_reservada : undefined;
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const novaQty =
          disponivel != null && disponivel >= 0
            ? (() => {
                const q = parseFloat(item.quantidade);
                return isNaN(q) || q > disponivel ? String(disponivel) : item.quantidade;
              })()
            : item.quantidade;
        return { ...item, id_item_estoque_produto: idItem, quantidade: novaQty };
      })
    );
  };

  const handleItemQuantidadeChange = (index: number, value: string, maxDisponivel?: number) => {
    const num = parseFloat(value);
    const capped =
      maxDisponivel != null && maxDisponivel >= 0 && !isNaN(num) && num > maxDisponivel
        ? String(maxDisponivel)
        : value;
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantidade: capped } : item))
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!numeroVenda.trim()) errs.numeroVenda = "Informe o número da venda.";
    if (!dataVenda.trim()) errs.dataVenda = "Informe a data da venda.";
    if (!idCliente) errs.idCliente = "Selecione o cliente.";
    if (formasPagamento.length > 0 && !idFormaPagamento) {
      errs.idFormaPagamento = "Selecione a forma de pagamento.";
    }
    if (itens.length === 0) {
      errs.itens = "Adicione pelo menos um item à venda.";
    } else {
      itens.forEach((item, i) => {
        if (!item.id_item_estoque_produto) {
          errs[`item_${i}_lote`] = "Selecione o lote.";
        }
        const qty = parseFloat(item.quantidade);
        if (isNaN(qty) || qty <= 0) {
          errs[`item_${i}_qty`] = "Quantidade inválida.";
        } else if (item.id_item_estoque_produto && item.id_estoque_produto) {
          const lotes = itensEstoqueMap[item.id_estoque_produto] ?? [];
          const lote = lotes.find((l) => l.id === item.id_item_estoque_produto);
          if (lote) {
            const disponivel = lote.quantidade - lote.quantidade_reservada;
            if (qty > disponivel) {
              errs[`item_${i}_qty`] = `A quantidade informada (${qty}) é maior que a disponível no lote (${disponivel}).`;
            }
          }
        }
        if (item.id_estoque_produto && getPrecoVenda(item.id_estoque_produto) < 0) {
          errs[`item_${i}_preco`] = "Produto sem preço de venda.";
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const itensPayload: ItemVendaCreate[] = itens
      .filter((i) => i.id_item_estoque_produto && i.id_estoque_produto)
      .map((i) => ({
        id_item_estoque_produto: i.id_item_estoque_produto,
        quantidade: parseFloat(i.quantidade),
        preco_unitario: getPrecoVenda(i.id_estoque_produto),
        desconto: 0,
        observacao: null,
      }));

    if (itensPayload.length === 0) {
      setErrors({ itens: "Adicione pelo menos um item válido." });
      return;
    }

    const data: VendaCreate = {
      numero_venda: numeroVenda,
      data_venda: dataVenda,
      status,
      parcelas: parseInt(parcelas, 10) || 1,
      desconto: parseFloat(desconto) || 0,
      observacoes: observacoes.trim() || null,
      id_empresa: idEmpresa,
      id_cliente: idCliente,
      id_forma_pagamento: idFormaPagamento,
      itens: itensPayload,
    };

    try {
      setSubmitting(true);
      await salesApi.create(data);
      for (const item of itensPayload) {
        const { data: estoqueItem } = await productItemsApi.getById(item.id_item_estoque_produto);
        if (estoqueItem) {
          const novaQuantidade = Math.max(0, estoqueItem.quantidade - item.quantidade);
          await productItemsApi.update(item.id_item_estoque_produto, {
            quantidade: novaQuantidade,
          });
          await movimentacoesApi.create({
            id_empresa: idEmpresa,
            id_usuario: idUsuario,
            tipo_estoque: "produto",
            tipo_operacao: "saida",
            quantidade: item.quantidade,
            id_item_estoque_produto: item.id_item_estoque_produto,
            motivo: "Venda",
            observacoes: numeroVenda ? `Venda ${numeroVenda}` : null,
          });
        }
      }
      onSuccess();
      onOpenChange(false);
      setItens([]);
      setNumeroVenda(generateNumeroVenda());
      setDataVenda(formatDateTimeLocal());
      setErrors({});
    } catch (err: unknown) {
      console.error("Erro ao criar venda:", err);
      setErrors({ submit: "Não foi possível criar a venda. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto gap-6">
        <DialogHeader className="space-y-2">
          <DialogTitle>Nova venda</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Preencha os dados da venda e adicione os itens.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <ul className="list-disc list-inside space-y-0.5">
                {errors.numeroVenda && <li>{errors.numeroVenda}</li>}
                {errors.dataVenda && <li>{errors.dataVenda}</li>}
                {errors.idCliente && <li>{errors.idCliente}</li>}
                {errors.idFormaPagamento && <li>{errors.idFormaPagamento}</li>}
                {errors.itens && <li>{errors.itens}</li>}
                {errors.submit && <li>{errors.submit}</li>}
                {Object.entries(errors)
                  .filter(
                    ([k]) =>
                      !["numeroVenda", "dataVenda", "idCliente", "idFormaPagamento", "itens", "submit"].includes(k)
                  )
                  .map(([k, msg]) => (
                    <li key={k}>{msg}</li>
                  ))}
              </ul>
            </div>
          )}

          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Número da venda</FieldLabel>
              <Input
                value={numeroVenda}
                onChange={(e) => setNumeroVenda(e.target.value)}
                placeholder="VND-2025-0001"
                aria-invalid={!!errors.numeroVenda}
              />
            </Field>
            <Field>
              <FieldLabel>Data da venda</FieldLabel>
              <Input
                type="datetime-local"
                value={dataVenda}
                onChange={(e) => setDataVenda(e.target.value)}
                aria-invalid={!!errors.dataVenda}
              />
            </Field>
            <Field>
              <FieldLabel>Status</FieldLabel>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_VENDA.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel>Parcelas</FieldLabel>
              <Input
                type="number"
                min={1}
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Cliente</FieldLabel>
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  disabled={clientesLoading}
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
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Forma de pagamento</FieldLabel>
                <select
                  value={idFormaPagamento}
                  onChange={(e) => setIdFormaPagamento(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-invalid={!!errors.idFormaPagamento}
                >
                  <option value="">
                    {formasPagamento.length === 0 ? "Nenhuma forma cadastrada" : "Selecione a forma de pagamento"}
                  </option>
                  {formasPagamento.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.tipo}{fp.descricao ? ` - ${fp.descricao}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field>
              <FieldLabel>Desconto (R$)</FieldLabel>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={formatCurrencyInput(desconto)}
                onChange={(e) => setDesconto(String(parseCurrencyInput(e.target.value)))}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Observações (opcional)</FieldLabel>
                <Input
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex.: forma de pagamento (PIX, cartão à vista, boleto, transferência, dinheiro...), outras observações da venda"
                />
              </Field>
            </div>
          </FieldGroup>

          <div>
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Itens da venda</FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                disabled={loadingProdutos}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar item
              </Button>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Selecione o produto e o lote. Só é possível vender até (quantidade do lote − quantidade reservada) por lote. O preço é o preço de venda do produto.
            </p>
            <div className="space-y-3">
              {itens.map((item, index) => {
                const precoVenda = getPrecoVenda(item.id_estoque_produto);
                const qty = parseFloat(item.quantidade) || 0;
                const totalLinha = precoVenda * qty;
                const lotesItem = item.id_estoque_produto ? itensEstoqueMap[item.id_estoque_produto] ?? [] : [];
                const loteSelecionado = lotesItem.find((l) => l.id === item.id_item_estoque_produto);
                const disponivel = loteSelecionado ? loteSelecionado.quantidade - loteSelecionado.quantidade_reservada : undefined;
                return (
                  <div
                    key={index}
                    className="flex flex-wrap gap-2 items-end p-3 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs text-slate-500 mb-1">Produto</label>
                      <select
                        value={item.id_estoque_produto}
                        onChange={(e) => handleItemProdutoChange(index, e.target.value)}
                        disabled={loadingProdutos}
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      >
                        <option value="">
                          {loadingProdutos ? "Carregando..." : "Selecione o produto"}
                        </option>
                        {produtos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome} ({p.codigo}) — {formatCurrencyInput(p.preco_venda)}/un
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[100px]">
                      <label className="block text-xs text-slate-500 mb-1">Lote</label>
                      <select
                        value={item.id_item_estoque_produto}
                        onChange={(e) => handleItemLoteChange(index, e.target.value, item.id_estoque_produto)}
                        disabled={
                          !item.id_estoque_produto ||
                          loadingItens === item.id_estoque_produto
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm"
                      >
                        <option value="">
                          {loadingItens === item.id_estoque_produto
                            ? "Carregando..."
                            : !item.id_estoque_produto
                              ? "Selecione o produto"
                              : "Selecione o lote"}
                        </option>
                        {(item.id_estoque_produto
                          ? itensEstoqueMap[item.id_estoque_produto] ?? []
                          : []
                        ).map((ie) => (
                          <option key={ie.id} value={ie.id}>
                            {ie.lote} (disp: {ie.quantidade - ie.quantidade_reservada})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-28">
                      <label className="block text-xs text-slate-500 mb-1">
                        Quantidade {disponivel != null && disponivel >= 0 ? `(máx. ${disponivel})` : ""}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={disponivel != null && disponivel >= 0 ? disponivel : undefined}
                        value={item.quantidade}
                        onChange={(e) => handleItemQuantidadeChange(index, e.target.value, disponivel)}
                        placeholder="Qtd"
                        aria-invalid={!!errors[`item_${index}_qty`]}
                        className={errors[`item_${index}_qty`] ? "border-destructive" : ""}
                      />
                      {errors[`item_${index}_qty`] && (
                        <p className="text-xs text-destructive mt-0.5">{errors[`item_${index}_qty`]}</p>
                      )}
                    </div>
                    <div className="w-28">
                      <label className="block text-xs text-slate-500 mb-1">Preço (R$)</label>
                      <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700">
                        {formatCurrencyInput(precoVenda)}
                      </div>
                    </div>
                    <div className="w-28">
                      <label className="block text-xs text-slate-500 mb-1">Total</label>
                      <div className="flex h-9 items-center font-medium rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900">
                        {formatCurrencyInput(totalLinha)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {itens.some((i) => i.id_item_estoque_produto && i.id_estoque_produto) && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal (itens)</span>
                <span>
                  {formatCurrencyInput(
                    itens
                      .filter((i) => i.id_item_estoque_produto && i.id_estoque_produto)
                      .reduce(
                        (acc, i) =>
                          acc + parseFloat(i.quantidade || "0") * getPrecoVenda(i.id_estoque_produto),
                        0
                      )
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Desconto</span>
                <span>- {formatCurrencyInput(parseFloat(desconto || "0"))}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total da venda</span>
                <span>
                  {formatCurrencyInput(
                    Math.max(
                      0,
                      itens
                        .filter((i) => i.id_item_estoque_produto && i.id_estoque_produto)
                        .reduce(
                          (acc, i) =>
                            acc + parseFloat(i.quantidade || "0") * getPrecoVenda(i.id_estoque_produto),
                          0
                        ) - parseFloat(desconto || "0")
                    )
                  )}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#2A64E8] cursor-pointer hover:bg-[#2A64E8]"
              disabled={submitting}
            >
              {submitting ? "Criando..." : "Criar venda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
