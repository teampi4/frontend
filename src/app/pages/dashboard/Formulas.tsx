import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ChevronDown,
  Bell,
  CircleQuestionMark,
  Filter,
  X,
} from "lucide-react";

// Hooks
import { useHeader } from "@/hooks/useHeader";
// APIs (fórmulas relacionam a estoque_producao - Produção)
import { formulasApi } from "@/app/features/formulas/api/formulas.api";
import { producaoApi } from "@/app/features/producao/api/producao.api";
import { insumosApi } from "@/app/features/insumos/api/insumos.api";

// Schemas e Types
import {
  FormulaFormSchema,
  type FormulaFormValues,
} from "@/app/features/formulas/formulas.schema";
import type {
  FormulaProducaoRead,
  FormulaView,
  ProdutoSelect,
  InsumoSelect,
} from "@/app/features/formulas/types";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FormulasDialog } from "@/components/formulas/FormulasDialog";
import { Input } from "@/components/ui/input";
import { getAuth } from "@/hooks/auth/useAuth";

type FormulaFilters = {
  unidadeMedida: string;
  custoMin: string;
  custoMax: string;
};

const defaultFilters: FormulaFilters = {
  unidadeMedida: "",
  custoMin: "",
  custoMax: "",
};

const UNIDADES_MEDIDA = ["UN", "KG", "L", "ML", "G", "CX", "PCT", "M", "M²"];

export const Formulas = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();

  // --- Estados ---
  const [formulasRaw, setFormulasRaw] = useState<FormulaProducaoRead[]>([]);
  const [productsList, setProductsList] = useState<ProdutoSelect[]>([]);
  const [insumosList, setInsumosList] = useState<InsumoSelect[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FormulaFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormulaFormValues>({
    resolver: zodResolver(FormulaFormSchema),
    defaultValues: {
      id_estoque_producao: "",
      ingredientes: [],
    },
  });

  // --- Loads ---
  // Produto = estoque_producao (Produção). Usar listByEmpresa para trazer só produções ativas da empresa (excluídas não aparecem).
  const loadAuxiliaryData = useCallback(async () => {
    if (!usuario?.id_empresa) return;
    try {
      const idEmpresa = String(usuario.id_empresa);
      const [prodsRes, insumosRes] = await Promise.all([
        producaoApi.listByEmpresa(idEmpresa),
        insumosApi.listByEmpresa(idEmpresa),
      ]);

      const prods = prodsRes.data ?? [];
      const insumos = insumosRes.data ?? [];

      setProductsList(
        prods.map((p) => ({
          id: p.id,
          nome: p.nome ?? "",
          unidade_medida: p.unidade_medida ?? "",
        }))
      );

      setInsumosList(
        insumos.map((i) => ({
          id: i.id,
          nome: i.nome ?? "",
          unidade_medida: i.unidade_medida ?? "",
          custo_unitario: Number(i.custo_unitario ?? 0),
        }))
      );
    } catch (error) {
      console.error("Erro ao carregar dados auxiliares", error);
      toast.error("Não foi possível carregar produtos e insumos. Tente novamente.");
    }
  }, [usuario?.id_empresa]);

  const loadFormulas = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await formulasApi.listAll({ limit: 2000 });
      setFormulasRaw(data || []);
    } catch (error) {
      toast.error("Não foi possível carregar as fórmulas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuxiliaryData();
    loadFormulas();
  }, [loadAuxiliaryData, loadFormulas]);

  // Recarregar produtos/insumos ao abrir o dialog para garantir lista atualizada
  useEffect(() => {
    if (isDialogOpen && usuario?.id_empresa) {
      loadAuxiliaryData();
    }
  }, [isDialogOpen, usuario?.id_empresa, loadAuxiliaryData]);

  // --- Header ---
  useEffect(() => {
    const hasEmpresa = !!usuario?.id_empresa;
    setHeader({
      pageName: "Fórmulas",
      pathPage: ["Início", "Fórmulas"].join(" > "),
      actions: hasEmpresa
        ? [
            {
              type: "node",
              node: (
                <input
                  id="formulas-search"
                  name="formulas-search"
                  type="search"
                  autoComplete="off"
                  className="h-10 w-64 rounded-md px-3 text-sm bg-white border border-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Procurar fórmula..."
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
              onClick: loadFormulas,
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
              label: "Nova Fórmula",
              icon: <Plus className="h-4 w-4" />,
              variant: "success",
              onClick: () => {
                setIsEditMode(false);
                form.reset({
                  id_estoque_producao: "",
                  ingredientes: [{ id_estoque_insumo: "", quantidade_necessaria: 0, observacao: "" }]
                });
                setIsDialogOpen(true);
              },
            },
            {
              type: "button",
              label: "",
              icon: <Bell className="h-6 w-6" />,
              variant: "transparent",
              onClick: () => {},
            },
            {
              type: "button",
              label: "",
              icon: <CircleQuestionMark className="h-6 w-6" />,
              variant: "transparent",
                onClick: () => {},
            },
          ]
        : null,
    });
  }, [setHeader, searchQuery, loadFormulas, usuario?.id_empresa, form, showFilters]);

  // Agrupamento por produto de produção: custo = soma(qtd × custo_unitario do insumo).
  const formulasGrouped: FormulaView[] = useMemo(() => {
    const map = new Map<string, FormulaView>();

    formulasRaw.forEach((item) => {
      const prod = productsList.find((p) => String(p.id) === String(item.id_estoque_producao));
      const insumo = insumosList.find((i) => String(i.id) === String(item.id_estoque_insumo));
      if (!prod) return;

      const custoLinha = (Number(item.quantidade_necessaria) || 0) * (Number(insumo?.custo_unitario) || 0);

      if (!map.has(item.id_estoque_producao)) {
        map.set(item.id_estoque_producao, {
          id_produto: item.id_estoque_producao,
          nome_produto: prod.nome,
          unidade_medida: prod.unidade_medida,
          qtd_ingredientes: 0,
          custo_total: 0,
        });
      }

      const entry = map.get(item.id_estoque_producao)!;
      entry.qtd_ingredientes += 1;
      entry.custo_total += custoLinha;
    });
    let result = Array.from(map.values());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.nome_produto.toLowerCase().includes(q));
    }

    if (filters.unidadeMedida.trim()) {
      result = result.filter((r) => r.unidade_medida === filters.unidadeMedida);
    }
    if (filters.custoMin.trim()) {
      const min = parseFloat(filters.custoMin.replace(",", "."));
      if (!isNaN(min)) result = result.filter((r) => r.custo_total >= min);
    }
    if (filters.custoMax.trim()) {
      const max = parseFloat(filters.custoMax.replace(",", "."));
      if (!isNaN(max)) result = result.filter((r) => r.custo_total <= max);
    }

    return result;
  }, [formulasRaw, productsList, insumosList, searchQuery, filters]);

  // --- Handlers ---
  const handleEdit = async (view: FormulaView) => {
    try {
      setIsLoading(true);
      const { data } = await formulasApi.getByProduto(view.id_produto);
      
      form.reset({
        id_estoque_producao: view.id_produto,
        ingredientes: data.map((item) => ({
          id_estoque_insumo: item.id_estoque_insumo,
          quantidade_necessaria: Number(item.quantidade_necessaria),
          observacao: item.observacao || "",
        })),
      });

      setIsEditMode(true);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar detalhes da fórmula.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fórmula relaciona a estoque_producao. Múltiplos POSTs, um por ingrediente.
  const handleSubmit = async (values: FormulaFormValues) => {
    try {
      if (!values.id_estoque_producao) {
        toast.warning("Selecione um produto para a fórmula.");
        return;
      }

      const idProduto = String(values.id_estoque_producao);
      const { data: existing } = await formulasApi.getByProduto(idProduto);
      if (existing && existing.length > 0) {
        await Promise.all(existing.map((item) => formulasApi.delete(item.id)));
      }

      const createPromises = values.ingredientes
        .filter(ing => ing.id_estoque_insumo && Number(ing.quantidade_necessaria) > 0)
        .map((ing) =>
          formulasApi.create({
            id_estoque_producao: idProduto,
            id_estoque_insumo: String(ing.id_estoque_insumo),
            quantidade_necessaria: Number(ing.quantidade_necessaria),
            observacao: ing.observacao || undefined,
          })
        );

      if (createPromises.length === 0) {
        toast.error("A fórmula deve ter pelo menos um ingrediente válido.");
        return;
      }

      await Promise.all(createPromises);
      
      toast.success(isEditMode ? "Fórmula atualizada com sucesso!" : "Fórmula criada com sucesso!");
      setIsDialogOpen(false);
      loadFormulas();
    } catch (error: unknown) {
      console.error("Erro ao salvar fórmula:", error);
      const res = (error as { response?: { data?: { detail?: string | Array<{ msg?: string }> } } })?.response?.data;
      const detail = res?.detail;
      const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d) => d.msg ?? "").filter(Boolean).join("; ") : null;
      toast.error(msg || "Erro ao salvar a fórmula. Verifique os dados e a conexão.");
    }
  };
  const hasActiveFilters =
    filters.unidadeMedida.trim() ||
    filters.custoMin.trim() ||
    filters.custoMax.trim();


  // Excluir fórmula = excluir todos os registros de fórmula daquele produto (um DELETE por registro).
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      const { data } = await formulasApi.getByProduto(itemToDelete);
      await Promise.all((data || []).map((item) => formulasApi.delete(item.id)));
      
      toast.success("Fórmula excluída com sucesso.");
      setItemToDelete(null);
      loadFormulas();
    } catch (error) {
      toast.error("Erro ao excluir a fórmula.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Render ---
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
                onClick={() => setFilters(defaultFilters)}
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
                Unidade de medida
              </label>
              <select
                value={filters.unidadeMedida}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, unidadeMedida: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todas</option>
                {UNIDADES_MEDIDA.map((un) => (
                  <option key={un} value={un}>
                    {un}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Custo mínimo (R$)
              </label>
              <Input
                type="text"
                placeholder="0,00"
                value={filters.custoMin}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, custoMin: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Custo máximo (R$)
              </label>
              <Input
                type="text"
                placeholder="0,00"
                value={filters.custoMax}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, custoMax: e.target.value }))
                }
              />
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Fórmulas</h2>
          <p className="text-sm text-slate-500">
            A fórmula de produção se relaciona com o produto cadastrado em <strong>Produção</strong> (estoque_producao). Define quanto de cada insumo consumir por unidade. Não cria estoque — só diz o que consumir na produção.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8 text-sm text-slate-500">
            Carregando fórmulas...
          </div>
        ) : formulasGrouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <p className="mb-2 text-sm">
              {searchQuery.trim() || hasActiveFilters
                ? "Nenhuma fórmula encontrada para os filtros aplicados."
                : "Nenhuma fórmula encontrada."}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <p className="text-xs">Tente ajustar sua busca ou os filtros.</p>
            )}
            {searchQuery && <p className="text-xs">Tente ajustar sua busca.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500 bg-slate-50/50">
                <tr>
                  <th className="py-3 px-4 font-medium">Produto</th>
                  <th className="py-3 px-4 font-medium">Unidade</th>
                  <th className="py-3 px-4 font-medium">Qtd. Itens</th>
                  <th className="py-3 px-4 font-medium">Custo Estimado</th>
                  <th className="py-3 px-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formulasGrouped.map((item) => (
                  <tr key={item.id_produto} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.nome_produto}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.unidade_medida}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {item.qtd_ingredientes} ingredientes
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.custo_total)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="h-8 px-3 text-slate-600 border-slate-200"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setItemToDelete(item.id_produto)}
                          className="h-8 px-3"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir
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

      {/* Dialogs */}
      <FormulasDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        form={form}
        onSubmit={handleSubmit}
        isEdit={isEditMode}
        listaProdutos={productsList}
        listaInsumos={insumosList}
      />

      <Dialog open={!!itemToDelete} onOpenChange={(o) => !o && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir fórmula</DialogTitle>
            <DialogDescription className="text-slate-500">
              Tem certeza que deseja excluir a fórmula do produto <span className="font-medium text-slate-900">{(formulasGrouped.find(f => f.id_produto === itemToDelete)?.nome_produto)}</span>?
              <br/>Esta ação removerá todos os vínculos de ingredientes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};