import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useHeader } from "@/hooks/useHeader";
import { getAuth } from "@/hooks/auth/useAuth";
import {
  ArrowUpDown,
  Bell,
  ChevronDown,
  ChevronUp,
  CircleQuestionMark,
  Filter,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { salesApi } from "@/app/features/sales/api/sales.api";
import { saleUpdateSchema, type SaleUpdateFormValues } from "@/app/features/sales/sales.schema";
import type { Venda, VendaWithItens } from "@/app/features/sales/types";
import { SalesDialog } from "@/components/sales/SalesDialog";
import { CreateSaleDialog } from "@/components/sales/CreateSaleDialog";
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTimeLocal = (dateStr: string) => {
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const parseDateBR = (str: string): Date | null => {
  if (!str?.trim()) return null;
  const [d, m, y] = str.split("/").map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const STATUS_LABELS: Record<string, string> = {
  orcamento: "Orçamento",
  confirmada: "Confirmada",
  faturada: "Faturada",
  cancelada: "Cancelada",
};

type SortColumn = "numero_venda" | "data_venda" | "cliente" | "valor_total" | "status";
type SortDirection = "asc" | "desc";

type SaleFilters = {
  dataInicio: string;
  dataFim: string;
  status: string;
  valorMin: string;
  valorMax: string;
};

const defaultFilters: SaleFilters = {
  dataInicio: "",
  dataFim: "",
  status: "todos",
  valorMin: "",
  valorMax: "",
};

const defaultSaleFormValues: SaleUpdateFormValues = {
  numero_venda: "",
  data_venda: "",
  status: "confirmada",
  id_cliente: "",
  id_forma_pagamento: "",
  parcelas: 1,
  desconto: 0,
  observacoes: "",
};

export const DashboardSales = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();
  const [sales, setSales] = useState<Venda[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<VendaWithItens | null>(null);
  const [saleToDelete, setSaleToDelete] = useState<Venda | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [expandedSaleDetails, setExpandedSaleDetails] = useState<VendaWithItens | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SaleFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [clientes, setClientes] = useState<Array<{ id: string; nome_fantasia?: string; razao_social?: string }>>([]);
  const [formasPagamento, setFormasPagamento] = useState<Array<{ id: string; tipo: string; descricao?: string }>>([]);
  const [formasLoading, setFormasLoading] = useState(false);
  const [clientesLoading, setClientesLoading] = useState(false);

  const saleForm = useForm<SaleUpdateFormValues>({
    resolver: zodResolver(saleUpdateSchema),
    defaultValues: defaultSaleFormValues,
  });

  const loadSales = useCallback(async () => {
    if (!usuario?.id_empresa) {
      setSales([]);
      return;
    }
    try {
      setSalesLoading(true);
      const { data } = await salesApi.listByEmpresa(usuario.id_empresa);
      setSales(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar vendas:", err);
      toast.error("Não foi possível carregar as vendas.");
    } finally {
      setSalesLoading(false);
    }
  }, [usuario?.id_empresa]);

  const loadClientes = useCallback(async () => {
    if (!usuario?.id_empresa) return;
    try {
      setClientesLoading(true);
      const { data } = await salesApi.getClientesByEmpresa(usuario.id_empresa);
      setClientes(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar clientes:", err);
      setClientes([]);
    } finally {
      setClientesLoading(false);
    }
  }, [usuario?.id_empresa]);

  const loadFormasPagamento = useCallback(async () => {
    if (!usuario?.id_empresa) return;
    try {
      setFormasLoading(true);
      const { data } = await salesApi.getFormasPagamentoByEmpresa(usuario.id_empresa);
      setFormasPagamento(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar formas de pagamento:", err);
      setFormasPagamento([]);
    } finally {
      setFormasLoading(false);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    if (usuario?.id_empresa) loadClientes();
  }, [usuario?.id_empresa, loadClientes]);

  useEffect(() => {
    const hasEmpresa = !!usuario?.id_empresa;
    setHeader({
      pageName: "Vendas",
      pathPage: ["Início", "Vendas"].join(" > "),
      actions: hasEmpresa
        ? [
            {
              type: "node",
              node: (
                <input
                  id="sales-search"
                  name="sales-search"
                  type="search"
                  autoComplete="off"
                  className="h-10 w-64 rounded-md px-3 text-sm bg-white"
                  placeholder="Procurar vendas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              ),
            },
            {
              type: "button",
              label: "Buscar",
              icon: <Search className="h-4 w-4" />,
              variant: "primary",
              onClick: () => loadSales(),
            },
            {
              type: "button",
              label: "Filtrar",
              icon: <Filter className="h-4 w-4" />,
              variant: showFilters ? "secondary" : "primary",
              onClick: () => setShowFilters((prev) => !prev),
            },
            {
              type: "button",
              label: "Mais ações",
              icon: <ChevronDown className="h-4 w-4" />,
              variant: "primary",
              onClick: () => {},
            },
            {
              type: "button",
              label: "Nova Venda",
              icon: <Plus className="h-4 w-4" />,
              onClick: () => {
                loadClientes();
                loadFormasPagamento();
                setIsCreateDialogOpen(true);
              },
              variant: "success",
            },
            {
              type: "button",
              label: "",
              icon: <Bell className="h-6 w-6" />,
              onClick: () => {},
              variant: "transparent",
            },
            {
              type: "button",
              label: "",
              icon: <CircleQuestionMark className="h-6 w-6" />,
              onClick: () => {},
              variant: "transparent",
            },
          ]
        : null,
    });
    return () =>
      setHeader({
        pageName: "",
        pathPage: null,
        actions: null,
      });
  }, [setHeader, searchQuery, loadSales, usuario?.id_empresa, showFilters]);

  const getClienteNome = (idCliente: string) => {
    const c = clientes.find((x) => x.id === idCliente);
    return c ? (c.nome_fantasia || c.razao_social || idCliente) : idCliente;
  };

  const handleSaleSubmit = async (values: SaleUpdateFormValues) => {
    if (!editingSale) return;
    try {
      const payload: Parameters<typeof salesApi.update>[1] = {
        numero_venda: values.numero_venda,
        data_venda: values.data_venda,
        status: values.status,
        parcelas: values.parcelas,
        desconto: values.desconto,
        observacoes: values.observacoes?.trim() || null,
      };
      if (values.id_cliente?.trim()) payload.id_cliente = values.id_cliente.trim();
      if (values.id_forma_pagamento?.trim()) payload.id_forma_pagamento = values.id_forma_pagamento.trim();
      await salesApi.update(editingSale.id, payload);
      await loadSales();
      toast.success("Venda atualizada com sucesso.");
      saleForm.reset(defaultSaleFormValues);
      setEditingSale(null);
      setIsSaleDialogOpen(false);
    } catch (err: unknown) {
      console.error("Erro ao atualizar venda:", err);
      toast.error("Não foi possível atualizar a venda.");
    }
  };

  const loadSaleDetails = useCallback(async (saleId: string) => {
    try {
      setDetailsLoading(true);
      const { data } = await salesApi.getById(saleId);
      setExpandedSaleDetails(data ?? null);
    } catch (err) {
      console.error("Erro ao carregar detalhes da venda:", err);
      toast.error("Não foi possível carregar os itens da venda.");
      setExpandedSaleDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const toggleExpandSale = (saleId: string) => {
    if (expandedSaleId === saleId) {
      setExpandedSaleId(null);
      setExpandedSaleDetails(null);
    } else {
      setExpandedSaleId(saleId);
      loadSaleDetails(saleId);
    }
  };

  const handleEditSale = async (sale: Venda) => {
    loadClientes();
    loadFormasPagamento();
    try {
      const { data } = await salesApi.getById(sale.id);
      const full = data ?? { ...sale, itens: [] };
      setEditingSale(full);
      saleForm.reset({
        numero_venda: full.numero_venda,
        data_venda: formatDateTimeLocal(full.data_venda),
        status: full.status,
        id_cliente: full.id_cliente,
        id_forma_pagamento: full.id_forma_pagamento,
        parcelas: full.parcelas,
        desconto: full.desconto,
        observacoes: full.observacoes ?? "",
      });
      setIsSaleDialogOpen(true);
    } catch (err) {
      console.error("Erro ao carregar venda:", err);
      toast.error("Não foi possível carregar a venda para edição.");
    }
  };

  const handleRequestDeleteSale = (sale: Venda) => {
    setSaleToDelete(sale);
  };

  const handleConfirmDeleteSale = async () => {
    if (!saleToDelete) return;
    try {
      setIsDeleting(true);
      await salesApi.delete(saleToDelete.id);
      setSales((prev) => prev.filter((s) => s.id !== saleToDelete.id));
      toast.success("Venda excluída com sucesso.");
      setSaleToDelete(null);
    } catch (err: unknown) {
      console.error("Erro ao excluir venda:", err);
      toast.error("Não foi possível excluir a venda.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedSales = useMemo(() => {
    let result = [...sales];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) =>
        s.numero_venda.toLowerCase().includes(q)
      );
    }

    if (filters.dataInicio.trim()) {
      const dataInicio = parseDateBR(filters.dataInicio);
      if (dataInicio) {
        result = result.filter((p) => new Date(p.data_venda) >= dataInicio);
      }
    }
    if (filters.dataFim.trim()) {
      const dataFim = parseDateBR(filters.dataFim);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        result = result.filter((p) => new Date(p.data_venda) <= fim);
      }
    }
    if (filters.status !== "todos") {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters.valorMin.trim()) {
      const min = parseFloat(filters.valorMin.replace(",", "."));
      if (!isNaN(min)) result = result.filter((s) => s.valor_total >= min);
    }
    if (filters.valorMax.trim()) {
      const max = parseFloat(filters.valorMax.replace(",", "."));
      if (!isNaN(max)) result = result.filter((s) => s.valor_total <= max);
    }

    if (sortColumn) {
      result.sort((a, b) => {
        let cmp = 0;
        if (sortColumn === "numero_venda") {
          cmp = a.numero_venda.localeCompare(b.numero_venda);
        } else if (sortColumn === "data_venda") {
          cmp = new Date(a.data_venda).getTime() - new Date(b.data_venda).getTime();
        } else if (sortColumn === "cliente") {
          const nomeA = getClienteNome(a.id_cliente).toLowerCase();
          const nomeB = getClienteNome(b.id_cliente).toLowerCase();
          cmp = nomeA.localeCompare(nomeB);
        } else if (sortColumn === "valor_total") {
          cmp = a.valor_total - b.valor_total;
        } else if (sortColumn === "status") {
          cmp = a.status.localeCompare(b.status);
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [sales, searchQuery, filters, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const hasActiveFilters =
    filters.dataInicio.trim() ||
    filters.dataFim.trim() ||
    filters.status !== "todos" ||
    filters.valorMin.trim() ||
    filters.valorMax.trim();

  const clearFilters = () => setFilters(defaultFilters);

  if (!usuario?.id_empresa) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Usuário sem empresa vinculada. Entre em contato com o administrador.
      </div>
    );
  }

  const SortableHeader = ({
    column,
    label,
  }: {
    column: SortColumn;
    label: string;
  }) => (
    <th
      className="py-2 pr-4 font-medium cursor-pointer select-none hover:bg-slate-50 transition-colors rounded"
      onClick={() => handleSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortColumn === column ? (
          sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4 inline" />
          ) : (
            <ChevronDown className="h-4 w-4 inline" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 inline opacity-40" />
        )}
      </span>
    </th>
  );

  return (
    <div className="space-y-6">
      {showFilters && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Filtros</h3>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-500"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Data venda (início)
              </label>
              <Input
                type="text"
                placeholder="DD/MM/AAAA"
                value={filters.dataInicio}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dataInicio: formatDateInput(e.target.value) }))
                }
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Data venda (fim)
              </label>
              <Input
                type="text"
                placeholder="DD/MM/AAAA"
                value={filters.dataFim}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dataFim: formatDateInput(e.target.value) }))
                }
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todos">Todos</option>
                <option value="orcamento">Orçamento</option>
                <option value="confirmada">Confirmada</option>
                <option value="faturada">Faturada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Valor mínimo (R$)
              </label>
              <Input
                type="text"
                placeholder="0,00"
                value={filters.valorMin}
                onChange={(e) => setFilters((prev) => ({ ...prev, valorMin: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Valor máximo (R$)
              </label>
              <Input
                type="text"
                placeholder="0,00"
                value={filters.valorMax}
                onChange={(e) => setFilters((prev) => ({ ...prev, valorMax: e.target.value }))}
              />
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Vendas</h2>
          <p className="text-sm text-slate-500">
            Lista de vendas cadastradas na empresa.
          </p>
        </div>
        {salesLoading ? (
          <div className="text-sm text-slate-500">Carregando vendas...</div>
        ) : filteredAndSortedSales.length === 0 ? (
          <div className="text-sm text-slate-500">
            {searchQuery.trim() || hasActiveFilters
              ? "Nenhuma venda encontrada para os filtros aplicados."
              : "Nenhuma venda cadastrada ainda."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <SortableHeader column="numero_venda" label="Número" />
                  <SortableHeader column="data_venda" label="Data da venda" />
                  <SortableHeader column="cliente" label="Cliente" />
                  <SortableHeader column="valor_total" label="Valor total" />
                  <SortableHeader column="status" label="Status" />
                  <th className="py-3 pr-4 pl-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedSales.map((sale) => (
                  <Fragment key={sale.id}>
                  <tr className="text-slate-700">
                    <td className="py-2 pr-4 font-mono text-xs">{sale.numero_venda}</td>
                    <td className="py-2 pr-4 text-slate-600">{formatDate(sale.data_venda)}</td>
                    <td className="py-2 pr-4">{getClienteNome(sale.id_cliente)}</td>
                    <td className="py-2 pr-4 font-medium">{formatCurrency(sale.valor_total)}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          sale.status === "confirmada" || sale.status === "faturada"
                            ? "text-emerald-600"
                            : sale.status === "cancelada"
                              ? "text-red-600"
                              : "text-slate-500"
                        }
                      >
                        {STATUS_LABELS[sale.status] || sale.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 pl-4 text-right">
                      <div className="flex justify-end gap-3 flex-wrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandSale(sale.id)}
                          className="h-8 px-3"
                          title="Ver itens"
                        >
                          <List className="h-4 w-4 mr-1" />
                          Ver itens
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSale(sale)}
                          className="h-8 px-4"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRequestDeleteSale(sale)}
                          className="h-8 px-4"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedSaleId === sale.id && (
                    <tr key={`${sale.id}-details`}>
                      <td colSpan={6} className="bg-slate-50 p-4">
                        {detailsLoading ? (
                          <div className="text-sm text-slate-500">Carregando itens...</div>
                        ) : expandedSaleDetails?.id === sale.id ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-slate-700">Itens da venda</h4>
                            <div className="overflow-x-auto rounded border border-slate-200 bg-white">
                              <table className="min-w-full text-sm">
                                <thead className="border-b border-slate-200 bg-slate-100 text-left text-slate-600">
                                  <tr>
                                    <th className="py-2 px-3">Qtd</th>
                                    <th className="py-2 px-3">Preço unit.</th>
                                    <th className="py-2 px-3">Desconto</th>
                                    <th className="py-2 px-3">Valor total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {(expandedSaleDetails.itens ?? []).map((item) => (
                                    <tr key={item.id}>
                                      <td className="py-2 px-3">{item.quantidade}</td>
                                      <td className="py-2 px-3">{formatCurrency(item.preco_unitario)}</td>
                                      <td className="py-2 px-3">{formatCurrency(item.desconto)}</td>
                                      <td className="py-2 px-3 font-medium">{formatCurrency(item.valor_total)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex gap-6 text-sm flex-wrap">
                              <span className="text-slate-600">
                                <strong>Valor total:</strong> {formatCurrency(expandedSaleDetails.valor_total)}
                              </span>
                              <span className="text-slate-600">
                                <strong>Desconto venda:</strong> {formatCurrency(expandedSaleDetails.desconto)}
                              </span>
                              <span className="text-slate-700 font-medium">
                                <strong>Valor líquido:</strong> {formatCurrency(expandedSaleDetails.valor_liquido)}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandSale(sale.id)}
                            >
                              Fechar
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SalesDialog
        open={isSaleDialogOpen}
        onOpenChange={(open) => {
          setIsSaleDialogOpen(open);
          if (!open) setEditingSale(null);
        }}
        form={saleForm}
        onSubmit={handleSaleSubmit}
        editingSale={editingSale}
        clientes={clientes}
        clientesLoading={clientesLoading}
        formasPagamento={formasPagamento}
        formasLoading={formasLoading}
        idEmpresa={usuario?.id_empresa ?? ""}
        idUsuario={usuario?.id ?? ""}
        onItensUpdated={() => {
          if (editingSale?.id) {
            salesApi.getById(editingSale.id).then(({ data }) => {
              if (data) setEditingSale(data);
            });
          }
        }}
      />

      <CreateSaleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          loadSales();
          toast.success("Venda criada com sucesso.");
        }}
        idEmpresa={usuario?.id_empresa ?? ""}
        idUsuario={usuario?.id ?? ""}
        clientes={clientes}
        formasPagamento={formasPagamento}
        clientesLoading={clientesLoading}
      />

      <Dialog
        open={!!saleToDelete}
        onOpenChange={(open) => !open && setSaleToDelete(null)}
      >
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir venda</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tem certeza que deseja excluir a venda{" "}
              <span className="font-medium text-slate-900">
                {saleToDelete?.numero_venda}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSaleToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteSale}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
