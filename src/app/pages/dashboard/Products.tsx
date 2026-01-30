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
import { productsApi } from "@/app/features/products/api/products.api";
import { productSchema, type ProductFormValues } from "@/app/features/products/products.schema";
import type { EstoqueProduto } from "@/app/features/products/types";
import { ProductsDialog } from "@/components/products/ProductsDialog";
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

const defaultProductValues: ProductFormValues = {
  codigo: "",
  nome: "",
  unidade_medida: "",
  descricao: "",
  custo_producao: 0,
  preco_venda: 0,
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
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

type SortColumn = "codigo" | "nome" | "unidade_medida" | "custo_producao" | "preco_venda" | "ativo" | "data_cadastro";
type SortDirection = "asc" | "desc";

type ProductFilters = {
  dataInicio: string;
  dataFim: string;
  status: "todos" | "ativo" | "inativo";
  unidadeMedida: string;
  precoMin: string;
  precoMax: string;
};

const defaultFilters: ProductFilters = {
  dataInicio: "",
  dataFim: "",
  status: "todos",
  unidadeMedida: "",
  precoMin: "",
  precoMax: "",
};

const UNIDADES_MEDIDA = ["UN", "KG", "L", "ML", "G", "CX", "PCT", "M", "M²"];

export const DashboardProducts = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();
  const [products, setProducts] = useState<EstoqueProduto[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EstoqueProduto | null>(null);
  const [productToDelete, setProductToDelete] = useState<EstoqueProduto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductValues,
  });

  const loadProducts = useCallback(async () => {
    if (!usuario?.id_empresa) {
      setProducts([]);
      return;
    }

    try {
      setProductsLoading(true);
      const { data } = await productsApi.listByEmpresa(usuario.id_empresa);
      setProducts(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar produtos:", err);
      toast.error("Não foi possível carregar os produtos.");
    } finally {
      setProductsLoading(false);
    }
  }, [usuario?.id_empresa]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const hasEmpresa = !!usuario?.id_empresa;
    setHeader({
      pageName: "Produtos",
      pathPage: ["Início", "Produtos"].join(" > "),
      actions: hasEmpresa ? [
        {
          type: "node",
          node: (
            <input
              id="products-search"
              name="products-search"
              type="search"
              autoComplete="off"
              className="h-10 w-64 rounded-md px-3 text-sm bg-white"
              placeholder="Procurar Produtos..."
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
          onClick: () => loadProducts(),
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
          label: "Novo Produto",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setEditingProduct(null);
            productForm.reset(defaultProductValues);
            setIsProductDialogOpen(true);
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
      ] : null,
    });

    return () =>
      setHeader({
        pageName: "",
        pathPage: null,
        actions: null,
      });
  }, [setHeader, searchQuery, loadProducts, usuario?.id_empresa, showFilters]);

  const handleProductSubmit = async (values: ProductFormValues) => {
    if (editingProduct) {
      try {
        const { data } = await productsApi.update(editingProduct.id, {
          codigo: values.codigo,
          nome: values.nome,
          unidade_medida: values.unidade_medida,
          descricao: values.descricao || null,
          custo_producao: values.custo_producao,
          preco_venda: values.preco_venda,
          ativo: values.ativo,
        });
        if (data) {
          setProducts((prev) =>
            prev.map((p) => (p.id === data.id ? data : p))
          );
        }
        toast.success("Produto atualizado com sucesso.");
        productForm.reset(defaultProductValues);
        setEditingProduct(null);
        setIsProductDialogOpen(false);
      } catch (err: unknown) {
        console.error("Erro ao atualizar produto:", err);
        toast.error("Não foi possível atualizar o produto.");
      }
      return;
    }

    if (!usuario?.id_empresa) {
      toast.error("Usuário sem empresa vinculada.");
      return;
    }

    try {
      const { data } = await productsApi.create({
        codigo: values.codigo,
        nome: values.nome,
        unidade_medida: values.unidade_medida,
        descricao: values.descricao || null,
        custo_producao: values.custo_producao,
        preco_venda: values.preco_venda,
        id_empresa: usuario.id_empresa,
      });
      if (data) {
        setProducts((prev) => [data, ...prev]);
      }
      toast.success("Produto cadastrado com sucesso.");
      productForm.reset(defaultProductValues);
      setIsProductDialogOpen(false);
    } catch (err: unknown) {
      console.error("Erro ao cadastrar produto:", err);
      toast.error("Não foi possível cadastrar o produto.");
    }
  };

  const handleEditProduct = (product: EstoqueProduto) => {
    setEditingProduct(product);
    productForm.reset({
      codigo: product.codigo,
      nome: product.nome,
      unidade_medida: product.unidade_medida,
      descricao: product.descricao ?? "",
      custo_producao: product.custo_producao,
      preco_venda: product.preco_venda,
      ativo: product.ativo,
    });
    setIsProductDialogOpen(true);
  };

  const handleRequestDeleteProduct = (product: EstoqueProduto) => {
    setProductToDelete(product);
  };

  const productUsedInConfirmedSale = useCallback(async (idEmpresa: string, productId: string): Promise<boolean> => {
    try {
      const { data: vendas } = await salesApi.listByEmpresa(idEmpresa);
      const confirmed = (vendas ?? []).filter((v) => v.status === "confirmada");
      const lotIds = new Set<string>();
      for (const v of confirmed) {
        const { data: full } = await salesApi.getById(v.id);
        if (full?.itens) for (const item of full.itens) lotIds.add(item.id_item_estoque_produto);
      }
      for (const lotId of lotIds) {
        const { data: lot } = await productItemsApi.getById(lotId);
        if (lot?.id_estoque_produto === productId) return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    if (!usuario?.id_empresa) {
      toast.error("Empresa não identificada.");
      return;
    }

    try {
      setIsDeleting(true);
      const used = await productUsedInConfirmedSale(usuario.id_empresa, productToDelete.id);
      if (used) {
        toast.error("Não é possível excluir este produto: ele está vinculado a uma ou mais vendas confirmadas.");
        setIsDeleting(false);
        return;
      }
      await productsApi.delete(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success("Produto excluído com sucesso.");
      setProductToDelete(null);
    } catch (err: unknown) {
      console.error("Erro ao excluir produto:", err);
      toast.error("Não foi possível excluir o produto.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Busca por nome ou código
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q)
      );
    }

    // Filtros
    if (filters.dataInicio.trim()) {
      const dataInicio = parseDateBR(filters.dataInicio);
      if (dataInicio) {
        result = result.filter((p) => new Date(p.data_cadastro) >= dataInicio);
      }
    }
    if (filters.dataFim.trim()) {
      const dataFim = parseDateBR(filters.dataFim);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        result = result.filter((p) => new Date(p.data_cadastro) <= fim);
      }
    }
    if (filters.status === "ativo") {
      result = result.filter((p) => p.ativo);
    } else if (filters.status === "inativo") {
      result = result.filter((p) => !p.ativo);
    }
    if (filters.unidadeMedida.trim()) {
      result = result.filter((p) => p.unidade_medida === filters.unidadeMedida);
    }
    if (filters.precoMin.trim()) {
      const min = parseFloat(filters.precoMin.replace(",", "."));
      if (!isNaN(min)) {
        result = result.filter((p) => p.preco_venda >= min);
      }
    }
    if (filters.precoMax.trim()) {
      const max = parseFloat(filters.precoMax.replace(",", "."));
      if (!isNaN(max)) {
        result = result.filter((p) => p.preco_venda <= max);
      }
    }

    // Ordenação
    if (sortColumn) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortColumn) {
          case "codigo":
            cmp = a.codigo.localeCompare(b.codigo);
            break;
          case "nome":
            cmp = a.nome.localeCompare(b.nome);
            break;
          case "unidade_medida":
            cmp = a.unidade_medida.localeCompare(b.unidade_medida);
            break;
          case "custo_producao":
            cmp = a.custo_producao - b.custo_producao;
            break;
          case "preco_venda":
            cmp = a.preco_venda - b.preco_venda;
            break;
          case "ativo":
            cmp = (a.ativo ? 1 : 0) - (b.ativo ? 1 : 0);
            break;
          case "data_cadastro":
            cmp = new Date(a.data_cadastro).getTime() - new Date(b.data_cadastro).getTime();
            break;
          default:
            break;
        }
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [products, searchQuery, filters, sortColumn, sortDirection]);

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
    filters.unidadeMedida.trim() ||
    filters.precoMin.trim() ||
    filters.precoMax.trim();

  const clearFilters = () => {
    setFilters(defaultFilters);
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
            <div className="flex gap-2">
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
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Data cadastro (início)
              </label>
              <Input
                type="text"
                placeholder="DD/MM/AAAA"
                value={filters.dataInicio}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dataInicio: formatDateInput(e.target.value),
                  }))
                }
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Data cadastro (fim)
              </label>
              <Input
                type="text"
                placeholder="DD/MM/AAAA"
                value={filters.dataFim}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dataFim: formatDateInput(e.target.value),
                  }))
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
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as ProductFilters["status"],
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
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
                Preço mínimo (R$)
              </label>
              <Input
                type="text"
                placeholder="0,00"
                value={filters.precoMin}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, precoMin: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Preço máximo (R$)
              </label>
              <Input
                type="text"
                placeholder="0,00"
                value={filters.precoMax}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, precoMax: e.target.value }))
                }
              />
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Produtos</h2>
          <p className="text-sm text-slate-500">
            Produtos vendíveis. O que aparece na venda e o cliente compra.
          </p>
        </div>
        {productsLoading ? (
          <div className="text-sm text-slate-500">Carregando produtos...</div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-sm text-slate-500">
            {searchQuery.trim() || hasActiveFilters
              ? "Nenhum produto encontrado para os filtros aplicados."
              : "Nenhum produto cadastrado ainda. Clique em Novo Produto para cadastrar."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <SortableHeader column="codigo" label="Código" />
                  <SortableHeader column="nome" label="Nome" />
                  <SortableHeader column="unidade_medida" label="Unidade" />
                  <SortableHeader column="custo_producao" label="Custo" />
                  <SortableHeader column="preco_venda" label="Preço venda" />
                  <SortableHeader column="ativo" label="Status" />
                  <SortableHeader column="data_cadastro" label="Cadastro" />
                  <th className="py-3 pr-4 pl-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedProducts.map((product) => (
                  <tr key={product.id} className="text-slate-700">
                    <td className="py-2 pr-4 font-mono text-xs">{product.codigo}</td>
                    <td className="py-2 pr-4">{product.nome}</td>
                    <td className="py-2 pr-4">{product.unidade_medida}</td>
                    <td className="py-2 pr-4">{formatCurrency(product.custo_producao)}</td>
                    <td className="py-2 pr-4">{formatCurrency(product.preco_venda)}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          product.ativo
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }
                      >
                        {product.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">
                      {formatDate(product.data_cadastro)}
                    </td>
                    <td className="py-3 pr-4 pl-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="h-8 px-4"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRequestDeleteProduct(product)}
                          className="h-8 px-4"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
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

      <ProductsDialog
        open={isProductDialogOpen}
        onOpenChange={(open) => {
          setIsProductDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        form={productForm}
        onSubmit={handleProductSubmit}
        editingProduct={editingProduct}
      />

      <Dialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir produto</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-medium text-slate-900">
                {productToDelete?.nome}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteProduct}
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
