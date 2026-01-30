import { useCallback, useEffect, useMemo, useState } from "react";
import { useHeader } from "@/hooks/useHeader";
import { getAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { insumosApi } from "@/app/features/insumos/api/insumos.api";
import { producaoApi } from "@/app/features/producao/api/producao.api";
import { productsApi } from "@/app/features/products/api/products.api";
import { productItemsApi } from "@/app/features/product-items/api/product-items.api";
import type { EstoqueInsumo } from "@/app/features/insumos/types";
import type { EstoqueProducao } from "@/app/features/producao/types";
import type { EstoqueProduto } from "@/app/features/products/types";
import type {
  ItemEstoqueInsumo,
  ItemEstoqueProducao,
  ItemEstoqueProduto,
} from "@/app/features/product-items/types";
import { InventoryInsumoItemDialog } from "@/components/inventory/InventoryInsumoItemDialog";
import { InventoryProducaoItemDialog } from "@/components/inventory/InventoryProducaoItemDialog";
import { InventoryProdutoItemDialog } from "@/components/inventory/InventoryProdutoItemDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

type Section = "insumos" | "producoes" | "produtos";

type SortColumnInsumo = "lote" | "quantidade" | "custo_unitario" | "data_entrada";
type SortColumnProducao = "lote" | "quantidade" | "custo_unitario" | "data_producao";
type SortColumnProduto = "lote" | "quantidade" | "quantidade_reservada" | "custo_unitario" | "data_producao";
type SortDirection = "asc" | "desc";

export const DashboardInventory = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();

  const [insumos, setInsumos] = useState<EstoqueInsumo[]>([]);
  const [producoes, setProducoes] = useState<EstoqueProducao[]>([]);
  const [produtos, setProdutos] = useState<EstoqueProduto[]>([]);

  const [selectedInsumoId, setSelectedInsumoId] = useState<string>("");
  const [selectedProducaoId, setSelectedProducaoId] = useState<string>("");
  const [selectedProdutoId, setSelectedProdutoId] = useState<string>("");

  const [itensInsumo, setItensInsumo] = useState<ItemEstoqueInsumo[]>([]);
  const [itensProducao, setItensProducao] = useState<ItemEstoqueProducao[]>([]);
  const [itensProduto, setItensProduto] = useState<ItemEstoqueProduto[]>([]);

  const [loadingInsumos, setLoadingInsumos] = useState(false);
  const [loadingProducoes, setLoadingProducoes] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  const [expandedSection, setExpandedSection] = useState<Section | null>("insumos");

  const [isInsumoDialogOpen, setIsInsumoDialogOpen] = useState(false);
  const [isProducaoDialogOpen, setIsProducaoDialogOpen] = useState(false);
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);

  const [editingInsumoItem, setEditingInsumoItem] = useState<ItemEstoqueInsumo | null>(null);
  const [editingProducaoItem, setEditingProducaoItem] = useState<ItemEstoqueProducao | null>(null);
  const [editingProdutoItem, setEditingProdutoItem] = useState<ItemEstoqueProduto | null>(null);

  const [itemToDelete, setItemToDelete] = useState<{
    type: Section;
    item: ItemEstoqueInsumo | ItemEstoqueProducao | ItemEstoqueProduto;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshInsumoKey, setRefreshInsumoKey] = useState(0);
  const [refreshProducaoKey, setRefreshProducaoKey] = useState(0);
  const [refreshProdutoKey, setRefreshProdutoKey] = useState(0);

  const [searchInsumo, setSearchInsumo] = useState("");
  const [searchProducao, setSearchProducao] = useState("");
  const [searchProduto, setSearchProduto] = useState("");

  const [sortInsumo, setSortInsumo] = useState<{ column: SortColumnInsumo | null; direction: SortDirection }>({ column: null, direction: "asc" });
  const [sortProducao, setSortProducao] = useState<{ column: SortColumnProducao | null; direction: SortDirection }>({ column: null, direction: "asc" });
  const [sortProduto, setSortProduto] = useState<{ column: SortColumnProduto | null; direction: SortDirection }>({ column: null, direction: "asc" });

  const loadInsumos = useCallback(async () => {
    const idEmpresa = usuario?.id_empresa != null ? String(usuario.id_empresa) : null;
    if (!idEmpresa) return;
    try {
      setLoadingInsumos(true);
      const { data } = await insumosApi.listByEmpresa(idEmpresa);
      setInsumos(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar insumos:", err);
      toast.error("Não foi possível carregar os insumos.");
    } finally {
      setLoadingInsumos(false);
    }
  }, [usuario?.id_empresa]);

  const loadProducoes = useCallback(async () => {
    if (!usuario?.id_empresa) return;
    try {
      setLoadingProducoes(true);
      const { data } = await producaoApi.listByEmpresa(usuario.id_empresa);
      setProducoes(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar produções:", err);
      toast.error("Não foi possível carregar as produções.");
    } finally {
      setLoadingProducoes(false);
    }
  }, [usuario?.id_empresa]);

  const loadProdutos = useCallback(async () => {
    if (!usuario?.id_empresa) return;
    try {
      setLoadingProdutos(true);
      const { data } = await productsApi.listByEmpresa(usuario.id_empresa);
      setProdutos(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      toast.error("Não foi possível carregar os produtos.");
    } finally {
      setLoadingProdutos(false);
    }
  }, [usuario?.id_empresa]);

  const loadItensInsumo = useCallback(async () => {
    if (!selectedInsumoId) {
      setItensInsumo([]);
      return;
    }
    try {
      const { data } = await productItemsApi.listByEstoqueInsumo(selectedInsumoId);
      setItensInsumo(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar itens de insumo:", err);
      setItensInsumo([]);
    }
  }, [selectedInsumoId]);

  const loadItensProducao = useCallback(async () => {
    if (!selectedProducaoId) {
      setItensProducao([]);
      return;
    }
    try {
      const { data } = await productItemsApi.listByEstoqueProducao(selectedProducaoId);
      setItensProducao(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar itens de produção:", err);
      setItensProducao([]);
    }
  }, [selectedProducaoId]);

  const loadItensProduto = useCallback(async () => {
    if (!selectedProdutoId) {
      setItensProduto([]);
      return;
    }
    try {
      const { data } = await productItemsApi.listByEstoqueProduto(selectedProdutoId);
      setItensProduto(data ?? []);
    } catch (err) {
      console.error("Erro ao carregar itens de produto:", err);
      setItensProduto([]);
    }
  }, [selectedProdutoId]);

  useEffect(() => {
    loadInsumos();
    loadProducoes();
    loadProdutos();
  }, [loadInsumos, loadProducoes, loadProdutos]);

  useEffect(() => {
    loadItensInsumo();
  }, [loadItensInsumo]);

  useEffect(() => {
    loadItensProducao();
  }, [loadItensProducao]);

  useEffect(() => {
    loadItensProduto();
  }, [loadItensProduto]);

  const refreshItensInsumo = useCallback(() => setRefreshInsumoKey((k) => k + 1), []);
  const refreshItensProducao = useCallback(() => setRefreshProducaoKey((k) => k + 1), []);
  const refreshItensProduto = useCallback(() => setRefreshProdutoKey((k) => k + 1), []);

  useEffect(() => {
    if (refreshInsumoKey > 0 && selectedInsumoId) loadItensInsumo();
  }, [refreshInsumoKey, selectedInsumoId, loadItensInsumo]);

  useEffect(() => {
    if (refreshProducaoKey > 0 && selectedProducaoId) loadItensProducao();
  }, [refreshProducaoKey, selectedProducaoId, loadItensProducao]);

  useEffect(() => {
    if (refreshProdutoKey > 0 && selectedProdutoId) loadItensProduto();
  }, [refreshProdutoKey, selectedProdutoId, loadItensProduto]);

  const filteredAndSortedItensInsumo = useMemo(() => {
    let result = [...itensInsumo];
    if (searchInsumo.trim()) {
      const q = searchInsumo.toLowerCase();
      result = result.filter(
        (i) =>
          i.lote.toLowerCase().includes(q) ||
          (i.localizacao?.toLowerCase().includes(q) ?? false) ||
          (i.observacoes?.toLowerCase().includes(q) ?? false)
      );
    }
    if (sortInsumo.column) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortInsumo.column) {
          case "lote":
            cmp = a.lote.localeCompare(b.lote);
            break;
          case "quantidade":
            cmp = a.quantidade - b.quantidade;
            break;
          case "custo_unitario":
            cmp = a.custo_unitario - b.custo_unitario;
            break;
          case "data_entrada":
            cmp = new Date(a.data_entrada).getTime() - new Date(b.data_entrada).getTime();
            break;
          default:
            break;
        }
        return sortInsumo.direction === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [itensInsumo, searchInsumo, sortInsumo]);

  const filteredAndSortedItensProducao = useMemo(() => {
    let result = [...itensProducao];
    if (searchProducao.trim()) {
      const q = searchProducao.toLowerCase();
      result = result.filter(
        (i) =>
          i.lote.toLowerCase().includes(q) ||
          (i.localizacao?.toLowerCase().includes(q) ?? false) ||
          (i.observacoes?.toLowerCase().includes(q) ?? false)
      );
    }
    if (sortProducao.column) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortProducao.column) {
          case "lote":
            cmp = a.lote.localeCompare(b.lote);
            break;
          case "quantidade":
            cmp = a.quantidade - b.quantidade;
            break;
          case "custo_unitario":
            cmp = a.custo_unitario - b.custo_unitario;
            break;
          case "data_producao":
            cmp = new Date(a.data_producao).getTime() - new Date(b.data_producao).getTime();
            break;
          default:
            break;
        }
        return sortProducao.direction === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [itensProducao, searchProducao, sortProducao]);

  const filteredAndSortedItensProduto = useMemo(() => {
    let result = [...itensProduto];
    if (searchProduto.trim()) {
      const q = searchProduto.toLowerCase();
      result = result.filter(
        (i) =>
          i.lote.toLowerCase().includes(q) ||
          (i.localizacao?.toLowerCase().includes(q) ?? false) ||
          (i.observacoes?.toLowerCase().includes(q) ?? false)
      );
    }
    if (sortProduto.column) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortProduto.column) {
          case "lote":
            cmp = a.lote.localeCompare(b.lote);
            break;
          case "quantidade":
            cmp = a.quantidade - b.quantidade;
            break;
          case "quantidade_reservada":
            cmp = a.quantidade_reservada - b.quantidade_reservada;
            break;
          case "custo_unitario":
            cmp = a.custo_unitario - b.custo_unitario;
            break;
          case "data_producao":
            cmp = new Date(a.data_producao).getTime() - new Date(b.data_producao).getTime();
            break;
          default:
            break;
        }
        return sortProduto.direction === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [itensProduto, searchProduto, sortProduto]);

  const handleSortInsumo = (column: SortColumnInsumo) => {
    setSortInsumo((s) => ({
      column,
      direction: s.column === column && s.direction === "asc" ? "desc" : "asc",
    }));
  };
  const handleSortProducao = (column: SortColumnProducao) => {
    setSortProducao((s) => ({
      column,
      direction: s.column === column && s.direction === "asc" ? "desc" : "asc",
    }));
  };
  const handleSortProduto = (column: SortColumnProduto) => {
    setSortProduto((s) => ({
      column,
      direction: s.column === column && s.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    setHeader({
      pageName: "Inventário",
      pathPage: ["Início", "Inventário"].join(" > "),
      actions: [
        {
          type: "node",
          node: (
            <input
              id="inventory-search"
              name="inventory-search"
              type="search"
              autoComplete="off"
              className="h-10 w-64 rounded-md px-3 text-sm bg-white"
              placeholder="Procurar..."
            />
          ),
        },
        {
          type: "button",
          label: "Buscar",
          icon: <Search className="h-4 w-4" />,
          variant: "primary",
          onClick: () => {},
        },
      ],
    });
    return () => setHeader({ pageName: "", pathPage: null, actions: null });
  }, [setHeader]);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      if (itemToDelete.type === "insumos") {
        await productItemsApi.deleteInsumo(itemToDelete.item.id);
        refreshItensInsumo();
      } else if (itemToDelete.type === "producoes") {
        await productItemsApi.deleteProducao(itemToDelete.item.id);
        refreshItensProducao();
      } else {
        await productItemsApi.delete(itemToDelete.item.id);
        refreshItensProduto();
      }
      toast.success("Item excluído com sucesso.");
      setItemToDelete(null);
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Não foi possível excluir o item.");
    } finally {
      setIsDeleting(false);
    }
  };

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
    currentSort,
    onSort,
  }: {
    column: SortColumnInsumo | SortColumnProducao | SortColumnProduto;
    label: string;
    currentSort: { column: string | null; direction: SortDirection };
    onSort: (col: typeof column) => void;
  }) => (
    <th
      className="py-2 px-4 font-medium cursor-pointer select-none hover:bg-slate-100 transition-colors rounded text-left text-slate-500"
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {currentSort.column === column ? (
          currentSort.direction === "asc" ? (
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

  const SectionHeader = ({
    section,
    title,
    count,
  }: {
    section: Section;
    title: string;
    count: number;
  }) => (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50 transition-colors"
      onClick={() => setExpandedSection((s) => (s === section ? null : section))}
    >
      <span className="flex items-center gap-2 font-semibold text-slate-900">
        {expandedSection === section ? (
          <ChevronDown className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
        {title}
      </span>
      <span className="text-sm text-slate-500">{count} cadastrados</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Inventário</h2>
        <p className="text-sm text-slate-500">
          Gerencie as quantidades dos lotes de insumos, produções e produtos.
        </p>
      </div>

      {/* Seção Insumos */}
      <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <SectionHeader
          section="insumos"
          title="Insumos"
          count={insumos.length}
        />
        {expandedSection === "insumos" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Selecione o insumo</label>
              <select
                value={selectedInsumoId}
                onChange={(e) => setSelectedInsumoId(e.target.value)}
                className="flex h-9 w-full max-w-md rounded-md border border-input bg-white px-3 py-1 text-sm"
              >
                <option value="">Selecione um insumo</option>
                {loadingInsumos ? (
                  <option disabled>Carregando...</option>
                ) : (
                  insumos.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} ({i.codigo})
                    </option>
                  ))
                )}
              </select>
            </div>
            {selectedInsumoId && (
              <>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <h3 className="text-sm font-medium text-slate-700">Lotes do insumo</h3>
                    <Input
                      className="h-9 w-64"
                      placeholder="Filtrar por lote, localização..."
                      value={searchInsumo}
                      onChange={(e) => setSearchInsumo(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingInsumoItem(null);
                      setIsInsumoDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo lote
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                      <tr>
                        <SortableHeader column="lote" label="Lote" currentSort={sortInsumo} onSort={handleSortInsumo} />
                        <SortableHeader column="quantidade" label="Quantidade" currentSort={sortInsumo} onSort={handleSortInsumo} />
                        <SortableHeader column="custo_unitario" label="Custo unit." currentSort={sortInsumo} onSort={handleSortInsumo} />
                        <SortableHeader column="data_entrada" label="Data entrada" currentSort={sortInsumo} onSort={handleSortInsumo} />
                        <th className="py-2 px-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAndSortedItensInsumo.map((item) => (
                        <tr key={item.id} className="text-slate-700">
                          <td className="py-2 px-4 font-mono text-xs">{item.lote}</td>
                          <td className="py-2 px-4">{item.quantidade}</td>
                          <td className="py-2 px-4">{formatCurrency(item.custo_unitario)}</td>
                          <td className="py-2 px-4 text-slate-500">{formatDate(item.data_entrada)}</td>
                          <td className="py-2 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingInsumoItem(item); setIsInsumoDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItemToDelete({ type: "insumos", item })}>
                              <Trash2 className="h-4 w-4 mr-1" /> Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAndSortedItensInsumo.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-500">
                      {searchInsumo.trim() ? "Nenhum lote encontrado para o filtro." : "Nenhum lote cadastrado. Clique em Novo lote para adicionar."}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Seção Produções */}
      <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <SectionHeader
          section="producoes"
          title="Produções"
          count={producoes.length}
        />
        {expandedSection === "producoes" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Selecione a produção</label>
              <select
                value={selectedProducaoId}
                onChange={(e) => setSelectedProducaoId(e.target.value)}
                className="flex h-9 w-full max-w-md rounded-md border border-input bg-white px-3 py-1 text-sm"
              >
                <option value="">Selecione uma produção</option>
                {loadingProducoes ? (
                  <option disabled>Carregando...</option>
                ) : (
                  producoes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.codigo})
                    </option>
                  ))
                )}
              </select>
            </div>
            {selectedProducaoId && (
              <>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <h3 className="text-sm font-medium text-slate-700">Lotes da produção</h3>
                    <Input
                      className="h-9 w-64"
                      placeholder="Filtrar por lote, localização..."
                      value={searchProducao}
                      onChange={(e) => setSearchProducao(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProducaoItem(null);
                      setIsProducaoDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo lote
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                      <tr>
                        <SortableHeader column="lote" label="Lote" currentSort={sortProducao} onSort={handleSortProducao} />
                        <SortableHeader column="quantidade" label="Quantidade" currentSort={sortProducao} onSort={handleSortProducao} />
                        <SortableHeader column="custo_unitario" label="Custo unit." currentSort={sortProducao} onSort={handleSortProducao} />
                        <SortableHeader column="data_producao" label="Data produção" currentSort={sortProducao} onSort={handleSortProducao} />
                        <th className="py-2 px-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAndSortedItensProducao.map((item) => (
                        <tr key={item.id} className="text-slate-700">
                          <td className="py-2 px-4 font-mono text-xs">{item.lote}</td>
                          <td className="py-2 px-4">{item.quantidade}</td>
                          <td className="py-2 px-4">{formatCurrency(item.custo_unitario)}</td>
                          <td className="py-2 px-4 text-slate-500">{formatDate(item.data_producao)}</td>
                          <td className="py-2 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingProducaoItem(item); setIsProducaoDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItemToDelete({ type: "producoes", item })}>
                              <Trash2 className="h-4 w-4 mr-1" /> Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAndSortedItensProducao.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-500">
                      {searchProducao.trim() ? "Nenhum lote encontrado para o filtro." : "Nenhum lote cadastrado. Clique em Novo lote para adicionar."}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Seção Produtos */}
      <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
        <SectionHeader
          section="produtos"
          title="Produtos"
          count={produtos.length}
        />
        {expandedSection === "produtos" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Selecione o produto</label>
              <select
                value={selectedProdutoId}
                onChange={(e) => setSelectedProdutoId(e.target.value)}
                className="flex h-9 w-full max-w-md rounded-md border border-input bg-white px-3 py-1 text-sm"
              >
                <option value="">Selecione um produto</option>
                {loadingProdutos ? (
                  <option disabled>Carregando...</option>
                ) : (
                  produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.codigo})
                    </option>
                  ))
                )}
              </select>
            </div>
            {selectedProdutoId && (
              <>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <h3 className="text-sm font-medium text-slate-700">Lotes do produto</h3>
                    <Input
                      className="h-9 w-64"
                      placeholder="Filtrar por lote, localização..."
                      value={searchProduto}
                      onChange={(e) => setSearchProduto(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProdutoItem(null);
                      setIsProdutoDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo lote
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                      <tr>
                        <SortableHeader column="lote" label="Lote" currentSort={sortProduto} onSort={handleSortProduto} />
                        <SortableHeader column="quantidade" label="Quantidade" currentSort={sortProduto} onSort={handleSortProduto} />
                        <SortableHeader column="quantidade_reservada" label="Reservada" currentSort={sortProduto} onSort={handleSortProduto} />
                        <SortableHeader column="custo_unitario" label="Custo unit." currentSort={sortProduto} onSort={handleSortProduto} />
                        <SortableHeader column="data_producao" label="Data produção" currentSort={sortProduto} onSort={handleSortProduto} />
                        <th className="py-2 px-4 font-medium text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAndSortedItensProduto.map((item) => (
                        <tr key={item.id} className="text-slate-700">
                          <td className="py-2 px-4 font-mono text-xs">{item.lote}</td>
                          <td className="py-2 px-4">{item.quantidade}</td>
                          <td className="py-2 px-4">{item.quantidade_reservada}</td>
                          <td className="py-2 px-4">{formatCurrency(item.custo_unitario)}</td>
                          <td className="py-2 px-4 text-slate-500">{formatDate(item.data_producao)}</td>
                          <td className="py-2 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingProdutoItem(item); setIsProdutoDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setItemToDelete({ type: "produtos", item })}>
                              <Trash2 className="h-4 w-4 mr-1" /> Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAndSortedItensProduto.length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-500">
                      {searchProduto.trim() ? "Nenhum lote encontrado para o filtro." : "Nenhum lote cadastrado. Clique em Novo lote para adicionar."}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Dialogs */}
      <InventoryInsumoItemDialog
        open={isInsumoDialogOpen}
        onOpenChange={(o) => {
          setIsInsumoDialogOpen(o);
          if (!o) setEditingInsumoItem(null);
        }}
        onSuccess={refreshItensInsumo}
        idEstoqueInsumo={selectedInsumoId}
        editingItem={editingInsumoItem}
      />
      <InventoryProducaoItemDialog
        open={isProducaoDialogOpen}
        onOpenChange={(o) => {
          setIsProducaoDialogOpen(o);
          if (!o) setEditingProducaoItem(null);
        }}
        onSuccess={refreshItensProducao}
        idEstoqueProducao={selectedProducaoId}
        editingItem={editingProducaoItem}
      />
      <InventoryProdutoItemDialog
        open={isProdutoDialogOpen}
        onOpenChange={(o) => {
          setIsProdutoDialogOpen(o);
          if (!o) setEditingProdutoItem(null);
        }}
        onSuccess={refreshItensProduto}
        idEstoqueProduto={selectedProdutoId}
        editingItem={editingProdutoItem}
      />

      <Dialog open={!!itemToDelete} onOpenChange={(o) => !o && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader>
            <DialogTitle>Excluir lote</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o lote{" "}
              <span className="font-medium text-slate-900">
                {itemToDelete?.item?.lote ?? ""}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
