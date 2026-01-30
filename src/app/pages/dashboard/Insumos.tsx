import { useCallback, useEffect, useMemo, useState } from "react";
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
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { insumosApi } from "@/app/features/insumos/api/insumos.api";
import { insumoSchema, type InsumoFormValues } from "@/app/features/insumos/insumos.schema";
import type { EstoqueInsumo } from "@/app/features/insumos/types";
import { InsumosDialog } from "@/components/insumos/InsumosDialog";
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

const defaultInsumoValues: InsumoFormValues = {
  codigo: "",
  nome: "",
  unidade_medida: "",
  descricao: "",
  fornecedor: "",
  custo_unitario: 0,
  ativo: true,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const parseDateBR = (str: string): Date | null => {
  if (!str?.trim()) return null;
  const [d, m, y] = str.split("/").map(Number);
  if (!d || !m || !y) return null;
  return isNaN(new Date(y, m - 1, d).getTime()) ? null : new Date(y, m - 1, d);
};

const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

type SortColumn = "codigo" | "nome" | "unidade_medida" | "custo_unitario" | "ativo" | "data_cadastro";
type SortDirection = "asc" | "desc";

type InsumoFilters = {
  dataInicio: string;
  dataFim: string;
  status: "todos" | "ativo" | "inativo";
  unidadeMedida: string;
};

const defaultFilters: InsumoFilters = {
  dataInicio: "",
  dataFim: "",
  status: "todos",
  unidadeMedida: "",
};

const UNIDADES_MEDIDA = ["UN", "KG", "L", "ML", "G", "CX", "PCT", "M", "M²"];

export const DashboardInsumos = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();
  const [insumos, setInsumos] = useState<EstoqueInsumo[]>([]);
  const [insumosLoading, setInsumosLoading] = useState(false);
  const [isInsumoDialogOpen, setIsInsumoDialogOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<EstoqueInsumo | null>(null);
  const [insumoToDelete, setInsumoToDelete] = useState<EstoqueInsumo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<InsumoFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const insumoForm = useForm<InsumoFormValues>({
    resolver: zodResolver(insumoSchema),
    defaultValues: defaultInsumoValues,
  });

  const loadInsumos = useCallback(async () => {
    const idEmpresa = usuario?.id_empresa != null ? String(usuario.id_empresa) : null;
    if (!idEmpresa) {
      setInsumos([]);
      return;
    }
    try {
      setInsumosLoading(true);
      const { data } = await insumosApi.listByEmpresa(idEmpresa);
      setInsumos(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar insumos:", err);
      toast.error("Não foi possível carregar os insumos.");
    } finally {
      setInsumosLoading(false);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    loadInsumos();
  }, [loadInsumos]);

  useEffect(() => {
    const hasEmpresa = !!usuario?.id_empresa;
    setHeader({
      pageName: "Insumos",
      pathPage: ["Início", "Insumos"].join(" > "),
      actions: hasEmpresa
        ? [
            { type: "node", node: <input id="insumos-search" name="insumos-search" type="search" autoComplete="off" className="h-10 w-64 rounded-md px-3 text-sm bg-white" placeholder="Procurar insumos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> },
            { type: "button", label: "Buscar", icon: <Search className="h-4 w-4" />, variant: "primary", onClick: () => loadInsumos() },
            { type: "button", label: "Filtrar", icon: <Filter className="h-4 w-4" />, variant: showFilters ? "secondary" : "primary", onClick: () => setShowFilters((p) => !p) },
            { type: "button", label: "Mais ações", icon: <ChevronDown className="h-4 w-4" />, variant: "primary", onClick: () => {} },
            { type: "button", label: "Novo Insumo", icon: <Plus className="h-4 w-4" />, onClick: () => { setEditingInsumo(null); insumoForm.reset(defaultInsumoValues); setIsInsumoDialogOpen(true); }, variant: "success" },
            { type: "button", label: "", icon: <Bell className="h-6 w-6" />, variant: "transparent", onClick: () => {} },
            { type: "button", label: "", icon: <CircleQuestionMark className="h-6 w-6" />, variant: "transparent", onClick: () => {} },
          ]
        : null,
    });
    return () => setHeader({ pageName: "", pathPage: null, actions: null });
  }, [setHeader, searchQuery, loadInsumos, usuario?.id_empresa, showFilters]);

  const handleInsumoSubmit = async (values: InsumoFormValues) => {
    if (editingInsumo) {
      try {
        const { data } = await insumosApi.update(editingInsumo.id, {
          codigo: values.codigo,
          nome: values.nome,
          unidade_medida: values.unidade_medida,
          descricao: values.descricao || null,
          fornecedor: values.fornecedor || null,
          custo_unitario: values.custo_unitario,
          ativo: values.ativo,
        });
        if (data) setInsumos((prev) => prev.map((i) => (i.id === data.id ? data : i)));
        toast.success("Insumo atualizado com sucesso.");
        insumoForm.reset(defaultInsumoValues);
        setEditingInsumo(null);
        setIsInsumoDialogOpen(false);
      } catch (err: unknown) {
        console.error("Erro ao atualizar insumo:", err);
        toast.error("Não foi possível atualizar o insumo.");
      }
      return;
    }
    if (!usuario?.id_empresa) {
      toast.error("Usuário sem empresa vinculada.");
      return;
    }
    try {
      const idEmpresa = String(usuario.id_empresa);
      const { data } = await insumosApi.create({
        codigo: values.codigo,
        nome: values.nome,
        unidade_medida: values.unidade_medida,
        descricao: values.descricao || null,
        fornecedor: values.fornecedor || null,
        custo_unitario: values.custo_unitario,
        id_empresa: idEmpresa,
      });
      if (data) setInsumos((prev) => [data, ...prev]);
      toast.success("Insumo cadastrado com sucesso.");
      insumoForm.reset(defaultInsumoValues);
      setIsInsumoDialogOpen(false);
    } catch (err: unknown) {
      console.error("Erro ao cadastrar insumo:", err);
      toast.error("Não foi possível cadastrar o insumo.");
    }
  };

  const handleEditInsumo = (insumo: EstoqueInsumo) => {
    setEditingInsumo(insumo);
    insumoForm.reset({
      codigo: insumo.codigo,
      nome: insumo.nome,
      unidade_medida: insumo.unidade_medida,
      descricao: insumo.descricao ?? "",
      fornecedor: insumo.fornecedor ?? "",
      custo_unitario: insumo.custo_unitario,
      ativo: insumo.ativo,
    });
    setIsInsumoDialogOpen(true);
  };

  const handleRequestDeleteInsumo = (insumo: EstoqueInsumo) => setInsumoToDelete(insumo);

  const handleConfirmDeleteInsumo = async () => {
    if (!insumoToDelete) return;
    try {
      setIsDeleting(true);
      await insumosApi.delete(insumoToDelete.id);
      setInsumos((prev) => prev.filter((i) => i.id !== insumoToDelete.id));
      toast.success("Insumo excluído com sucesso.");
      setInsumoToDelete(null);
    } catch (err: unknown) {
      console.error("Erro ao excluir insumo:", err);
      toast.error("Não foi possível excluir o insumo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedInsumos = useMemo(() => {
    let result = [...insumos];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.nome.toLowerCase().includes(q) || i.codigo.toLowerCase().includes(q));
    }
    if (filters.dataInicio.trim()) {
      const d = parseDateBR(filters.dataInicio);
      if (d) result = result.filter((i) => new Date(i.data_cadastro) >= d);
    }
    if (filters.dataFim.trim()) {
      const d = parseDateBR(filters.dataFim);
      if (d) {
        const fim = new Date(d);
        fim.setHours(23, 59, 59, 999);
        result = result.filter((i) => new Date(i.data_cadastro) <= fim);
      }
    }
    if (filters.status === "ativo") result = result.filter((i) => i.ativo);
    else if (filters.status === "inativo") result = result.filter((i) => !i.ativo);
    if (filters.unidadeMedida.trim()) result = result.filter((i) => i.unidade_medida === filters.unidadeMedida);
    if (sortColumn) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortColumn) {
          case "codigo": cmp = a.codigo.localeCompare(b.codigo); break;
          case "nome": cmp = a.nome.localeCompare(b.nome); break;
          case "unidade_medida": cmp = a.unidade_medida.localeCompare(b.unidade_medida); break;
          case "custo_unitario": cmp = a.custo_unitario - b.custo_unitario; break;
          case "ativo": cmp = (a.ativo ? 1 : 0) - (b.ativo ? 1 : 0); break;
          case "data_cadastro": cmp = new Date(a.data_cadastro).getTime() - new Date(b.data_cadastro).getTime(); break;
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [insumos, searchQuery, filters, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) setSortDirection((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const hasActiveFilters =
    filters.dataInicio.trim() ||
    filters.dataFim.trim() ||
    filters.status !== "todos" ||
    filters.unidadeMedida.trim();

  const SortableHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <th className="py-2 pr-4 font-medium cursor-pointer select-none hover:bg-slate-50 transition-colors rounded" onClick={() => handleSort(column)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {sortColumn === column ? (sortDirection === "asc" ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />) : <ArrowUpDown className="h-4 w-4 inline opacity-40" />}
      </span>
    </th>
  );

  if (!usuario?.id_empresa) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Usuário sem empresa vinculada. Entre em contato com o administrador.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Filtros</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => setFilters(defaultFilters)} className="text-slate-500">
                <X className="h-4 w-4 mr-1" /> Limpar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Data cadastro (início)</label>
              <Input type="text" placeholder="DD/MM/AAAA" value={filters.dataInicio} onChange={(e) => setFilters((p) => ({ ...p, dataInicio: formatDateInput(e.target.value) }))} maxLength={10} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Data cadastro (fim)</label>
              <Input type="text" placeholder="DD/MM/AAAA" value={filters.dataFim} onChange={(e) => setFilters((p) => ({ ...p, dataFim: formatDateInput(e.target.value) }))} maxLength={10} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
              <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as InsumoFilters["status"] }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="todos">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Unidade de medida</label>
              <select value={filters.unidadeMedida} onChange={(e) => setFilters((p) => ({ ...p, unidadeMedida: e.target.value }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Todas</option>
                {UNIDADES_MEDIDA.map((un) => (
                  <option key={un} value={un}>{un}</option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Insumos</h2>
          <p className="text-sm text-slate-500">Matérias-primas (ingredientes, embalagens, etc.). Tudo tem estoque.</p>
        </div>
        {insumosLoading ? (
          <div className="text-sm text-slate-500">Carregando insumos...</div>
        ) : filteredAndSortedInsumos.length === 0 ? (
          <div className="text-sm text-slate-500">
            {searchQuery.trim() || hasActiveFilters ? "Nenhum insumo encontrado para os filtros aplicados." : "Nenhum insumo cadastrado ainda. Clique em Novo Insumo para cadastrar."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <SortableHeader column="codigo" label="Código" />
                  <SortableHeader column="nome" label="Nome" />
                  <SortableHeader column="unidade_medida" label="Unidade" />
                  <SortableHeader column="custo_unitario" label="Custo unitário" />
                  <th className="py-2 pr-4 font-medium">Fornecedor</th>
                  <SortableHeader column="ativo" label="Status" />
                  <SortableHeader column="data_cadastro" label="Cadastro" />
                  <th className="py-3 pr-4 pl-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedInsumos.map((insumo) => (
                  <tr key={insumo.id} className="text-slate-700">
                    <td className="py-2 pr-4 font-mono text-xs">{insumo.codigo}</td>
                    <td className="py-2 pr-4">{insumo.nome}</td>
                    <td className="py-2 pr-4">{insumo.unidade_medida}</td>
                    <td className="py-2 pr-4">{formatCurrency(insumo.custo_unitario)}</td>
                    <td className="py-2 pr-4 text-slate-500">{insumo.fornecedor ?? "-"}</td>
                    <td className="py-2 pr-4">
                      <span className={insumo.ativo ? "text-emerald-600" : "text-slate-400"}>{insumo.ativo ? "Ativo" : "Inativo"}</span>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{formatDate(insumo.data_cadastro)}</td>
                    <td className="py-3 pr-4 pl-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={() => handleEditInsumo(insumo)} className="h-8 px-4">
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRequestDeleteInsumo(insumo)} className="h-8 px-4">
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <InsumosDialog open={isInsumoDialogOpen} onOpenChange={(o) => { setIsInsumoDialogOpen(o); if (!o) setEditingInsumo(null); }} form={insumoForm} onSubmit={handleInsumoSubmit} editingInsumo={editingInsumo} />

      <Dialog open={!!insumoToDelete} onOpenChange={(o) => !o && setInsumoToDelete(null)}>
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir insumo</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tem certeza que deseja excluir o insumo <span className="font-medium text-slate-900">{insumoToDelete?.nome}</span>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-2">
            <Button variant="outline" onClick={() => setInsumoToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteInsumo} disabled={isDeleting}>{isDeleting ? "Excluindo..." : "Excluir"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
