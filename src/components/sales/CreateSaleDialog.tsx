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
import type { EstoqueProduto } from "@/app/features/products/types";
import type { ItemEstoqueProduto } from "@/app/features/product-items/types";
import type { ItemVendaCreate, VendaCreate } from "@/app/features/sales/types";
import { Plus, Trash2 } from "lucide-react";

type CreateSaleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  idEmpresa: string;
  clientes: Array<{ id: string; nome_fantasia?: string; razao_social?: string }>;
  formasPagamento: Array<{ id: string; tipo: string; descricao?: string }>;
  clientesLoading: boolean;
  formasLoading: boolean;
};

type ItemForm = {
  id_estoque_produto: string;
  id_item_estoque_produto: string;
  quantidade: string;
  preco_unitario: string;
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
  clientes,
  formasPagamento,
  clientesLoading,
  formasLoading,
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
    }
  }, [open, idEmpresa, loadProdutos]);

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
        preco_unitario: "0",
      },
    ]);
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

  const handleItemLoteChange = (index: number, idItem: string) => {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, id_item_estoque_produto: idItem } : item
      )
    );
  };

  const handleItemFieldChange = (
    index: number,
    field: "quantidade" | "preco_unitario",
    value: string
  ) => {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!numeroVenda.trim()) errs.numeroVenda = "Informe o número da venda.";
    if (!dataVenda.trim()) errs.dataVenda = "Informe a data da venda.";
    if (!idCliente) errs.idCliente = "Selecione o cliente.";
    if (!idFormaPagamento) errs.idFormaPagamento = "Selecione a forma de pagamento.";
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
        }
        const preco = parseFloat(item.preco_unitario);
        if (isNaN(preco) || preco < 0) {
          errs[`item_${i}_preco`] = "Preço inválido.";
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
      .filter((i) => i.id_item_estoque_produto)
      .map((i) => ({
        id_item_estoque_produto: i.id_item_estoque_produto,
        quantidade: parseFloat(i.quantidade),
        preco_unitario: parseFloat(i.preco_unitario),
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
                  disabled={formasLoading}
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

            <div className="space-y-3">
              {itens.map((item, index) => (
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
                          {p.nome} ({p.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-xs text-slate-500 mb-1">Lote</label>
                    <select
                      value={item.id_item_estoque_produto}
                      onChange={(e) => handleItemLoteChange(index, e.target.value)}
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
                  <div className="w-20">
                    <label className="block text-xs text-slate-500 mb-1">Qtd</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.quantidade}
                      onChange={(e) =>
                        handleItemFieldChange(index, "quantidade", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-slate-500 mb-1">Preço (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.preco_unitario}
                      onChange={(e) =>
                        handleItemFieldChange(index, "preco_unitario", e.target.value)
                      }
                    />
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
              ))}
            </div>
          </div>

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
