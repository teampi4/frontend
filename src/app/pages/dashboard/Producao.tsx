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
import { producaoApi } from "@/app/features/producao/api/producao.api";
import { producaoSchema, type ProducaoFormValues } from "@/app/features/producao/producao.schema";
import type { EstoqueProducao } from "@/app/features/producao/types";
import { ProducaoDialog } from "@/components/producao/ProducaoDialog";
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

const defaultProducaoValues: ProducaoFormValues = {
  codigo: "",
  nome: "",
  unidade_medida: "",
  descricao: "",
  custo_producao: 0,
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

type SortColumn = "codigo" | "nome" | "unidade_medida" | "custo_producao" | "ativo" | "data_cadastro";
type SortDirection = "asc" | "desc";

type ProducaoFilters = {
  dataInicio: string;
  dataFim: string;
  status: "todos" | "ativo" | "inativo";
  unidadeMedida: string;
};

const defaultFilters: ProducaoFilters = {
  dataInicio: "",
  dataFim: "",
  status: "todos",
  unidadeMedida: "",
};

const UNIDADES_MEDIDA = ["UN", "KG", "L", "ML", "G", "CX", "PCT", "M", "M²"];

export const DashboardProducao = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();
  const [producoes, setProducoes] = useState<EstoqueProducao[]>([]);
  const [producoesLoading, setProducoesLoading] = useState(false);
  const [isProducaoDialogOpen, setIsProducaoDialogOpen] = useState(false);
  const [editingProducao, setEditingProducao] = useState<EstoqueProducao | null>(null);
  const [producaoToDelete, setProducaoToDelete] = useState<EstoqueProducao | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProducaoFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const producaoForm = useForm<ProducaoFormValues>({
    resolver: zodResolver(producaoSchema),
    defaultValues: defaultProducaoValues,
  });

  const loadProducoes = useCallback(async () => {
    if (!usuario?.id_empresa) {
      setProducoes([]);
      return;
    }
    try {
      setProducoesLoading(true);
      const { data } = await producaoApi.listByEmpresa(usuario.id_empresa);
      setProducoes(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar produções:", err);
      toast.error("Não foi possível carregar as produções.");
    } finally {
      setProducoesLoading(false);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    loadProducoes();
  }, [loadProducoes]);

  useEffect(() => {
    const hasEmpresa = !!usuario?.id_empresa;
    setHeader({
      pageName: "Produção",
      pathPage: ["Início", "Produção"].join(" > "),
      actions: hasEmpresa
        ? [
            { type: "node", node: <input className="h-10 w-64 rounded-md px-3 text-sm bg-white" placeholder="Procurar produções..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /> },
            { type: "button", label: "Buscar", icon: <Search className="h-4 w-4" />, variant: "primary", onClick: () => loadProducoes() },
            { type: "button", label: "Filtrar", icon: <Filter className="h-4 w-4" />, variant: showFilters ? "secondary" : "primary", onClick: () => setShowFilters((p) => !p) },
            { type: "button", label: "Mais ações", icon: <ChevronDown className="h-4 w-4" />, variant: "primary", onClick: () => {} },
            { type: "button", label: "Nova Produção", icon: <Plus className="h-4 w-4" />, onClick: () => { setEditingProducao(null); producaoForm.reset(defaultProducaoValues); setIsProducaoDialogOpen(true); }, variant: "success" },
            { type: "button", label: "", icon: <Bell className="h-6 w-6" />, variant: "transparent", onClick: () => {} },
            { type: "button", label: "", icon: <CircleQuestionMark className="h-6 w-6" />, variant: "transparent", onClick: () => {} },
          ]
        : null,
    });
    return () => setHeader({ pageName: "", pathPage: null, actions: null });
  }, [setHeader, searchQuery, loadProducoes, usuario?.id_empresa, showFilters]);

  const handleProducaoSubmit = async (values: ProducaoFormValues) => {
    if (editingProducao) {
      try {
        const { data } = await producaoApi.update(editingProducao.id, {
          codigo: values.codigo,
          nome: values.nome,
          unidade_medida: values.unidade_medida,
          descricao: values.descricao || null,
          custo_producao: values.custo_producao,
          ativo: values.ativo,
        });
        if (data) setProducoes((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        toast.success("Produção atualizada com sucesso.");
        producaoForm.reset(defaultProducaoValues);
        setEditingProducao(null);
        setIsProducaoDialogOpen(false);
      } catch (err: unknown) {
        console.error("Erro ao atualizar produção:", err);
        toast.error("Não foi possível atualizar a produção.");
      }
      return;
    }
    if (!usuario?.id_empresa) {
      toast.error("Usuário sem empresa vinculada.");
      return;
    }
    try {
      const { data } = await producaoApi.create({
        codigo: values.codigo,
        nome: values.nome,
        unidade_medida: values.unidade_medida,
        descricao: values.descricao || null,
        custo_producao: values.custo_producao,
        id_empresa: usuario.id_empresa,
      });
      if (data) setProducoes((prev) => [data, ...prev]);
      toast.success("Produção cadastrada com sucesso.");
      producaoForm.reset(defaultProducaoValues);
      setIsProducaoDialogOpen(false);
    } catch (err: unknown) {
      console.error("Erro ao cadastrar produção:", err);
      toast.error("Não foi possível cadastrar a produção.");
    }
  };

  const handleEditProducao = (producao: EstoqueProducao) => {
    setEditingProducao(producao);
    producaoForm.reset({
      codigo: producao.codigo,
      nome: producao.nome,
      unidade_medida: producao.unidade_medida,
      descricao: producao.descricao ?? "",
      custo_producao: producao.custo_producao,
      ativo: producao.ativo,
    });
    setIsProducaoDialogOpen(true);
  };

  const handleRequestDeleteProducao = (producao: EstoqueProducao) => setProducaoToDelete(producao);

  const handleConfirmDeleteProducao = async () => {
    if (!producaoToDelete) return;
    try {
      setIsDeleting(true);
      await producaoApi.delete(producaoToDelete.id);
      setProducoes((prev) => prev.filter((p) => p.id !== producaoToDelete.id));
      toast.success("Produção excluída com sucesso.");
      setProducaoToDelete(null);
    } catch (err: unknown) {
      console.error("Erro ao excluir produção:", err);
      toast.error("Não foi possível excluir a produção.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedProducoes = useMemo(() => {
    let result = [...producoes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q));
    }
    if (filters.dataInicio.trim()) {
      const d = parseDateBR(filters.dataInicio);
      if (d) result = result.filter((p) => new Date(p.data_cadastro) >= d);
    }
    if (filters.dataFim.trim()) {
      const d = parseDateBR(filters.dataFim);
      if (d) {
        const fim = new Date(d);
        fim.setHours(23, 59, 59, 999);
        result = result.filter((p) => new Date(p.data_cadastro) <= fim);
      }
    }
    if (filters.status === "ativo") result = result.filter((p) => p.ativo);
    else if (filters.status === "inativo") result = result.filter((p) => !p.ativo);
    if (filters.unidadeMedida.trim()) result = result.filter((p) => p.unidade_medida === filters.unidadeMedida);
    if (sortColumn) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortColumn) {
          case "codigo": cmp = a.codigo.localeCompare(b.codigo); break;
          case "nome": cmp = a.nome.localeCompare(b.nome); break;
          case "unidade_medida": cmp = a.unidade_medida.localeCompare(b.unidade_medida); break;
          case "custo_producao": cmp = a.custo_producao - b.custo_producao; break;
          case "ativo": cmp = (a.ativo ? 1 : 0) - (b.ativo ? 1 : 0); break;
          case "data_cadastro": cmp = new Date(a.data_cadastro).getTime() - new Date(b.data_cadastro).getTime(); break;
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [producoes, searchQuery, filters, sortColumn, sortDirection]);

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
              <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as ProducaoFilters["status"] }))} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
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
          <h2 className="text-lg font-semibold text-slate-900">Produção</h2>
          <p className="text-sm text-slate-500">Lista de produções cadastradas na empresa.</p>
        </div>
        {producoesLoading ? (
          <div className="text-sm text-slate-500">Carregando produções...</div>
        ) : filteredAndSortedProducoes.length === 0 ? (
          <div className="text-sm text-slate-500">
            {searchQuery.trim() || hasActiveFilters ? "Nenhuma produção encontrada para os filtros aplicados." : "Nenhuma produção cadastrada ainda. Clique em Nova Produção para cadastrar."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <SortableHeader column="codigo" label="Código" />
                  <SortableHeader column="nome" label="Nome" />
                  <SortableHeader column="unidade_medida" label="Unidade" />
                  <SortableHeader column="custo_producao" label="Custo produção" />
                  <SortableHeader column="ativo" label="Status" />
                  <SortableHeader column="data_cadastro" label="Cadastro" />
                  <th className="py-3 pr-4 pl-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedProducoes.map((producao) => (
                  <tr key={producao.id} className="text-slate-700">
                    <td className="py-2 pr-4 font-mono text-xs">{producao.codigo}</td>
                    <td className="py-2 pr-4">{producao.nome}</td>
                    <td className="py-2 pr-4">{producao.unidade_medida}</td>
                    <td className="py-2 pr-4">{formatCurrency(producao.custo_producao)}</td>
                    <td className="py-2 pr-4">
                      <span className={producao.ativo ? "text-emerald-600" : "text-slate-400"}>{producao.ativo ? "Ativo" : "Inativo"}</span>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{formatDate(producao.data_cadastro)}</td>
                    <td className="py-3 pr-4 pl-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={() => handleEditProducao(producao)} className="h-8 px-4">
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRequestDeleteProducao(producao)} className="h-8 px-4">
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

      <ProducaoDialog open={isProducaoDialogOpen} onOpenChange={(o) => { setIsProducaoDialogOpen(o); if (!o) setEditingProducao(null); }} form={producaoForm} onSubmit={handleProducaoSubmit} editingProducao={editingProducao} />

      <Dialog open={!!producaoToDelete} onOpenChange={(o) => !o && setProducaoToDelete(null)}>
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir produção</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tem certeza que deseja excluir a produção <span className="font-medium text-slate-900">{producaoToDelete?.nome}</span>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-2">
            <Button variant="outline" onClick={() => setProducaoToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteProducao} disabled={isDeleting}>{isDeleting ? "Excluindo..." : "Excluir"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
