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
import { formulasApi } from "@/app/features/formulas/api/formulas.api";
import { productItemsApi } from "@/app/features/product-items/api/product-items.api";
import { movimentacoesApi } from "@/app/features/movimentacoes/api/movimentacoes.api";
import type { EstoqueProducao } from "@/app/features/producao/types";
import type { FormulaProducaoRead } from "@/app/features/formulas/types";
import type { ItemEstoqueInsumo } from "@/app/features/product-items/types";

type InsumoSelect = { id: string; nome: string; unidade_medida: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producoes: EstoqueProducao[];
  insumos: InsumoSelect[];
  idEmpresa: string;
  idUsuario: string;
  onSuccess: () => void;
};

export const ExecutarProducaoDialog = ({
  open,
  onOpenChange,
  producoes,
  insumos,
  idEmpresa,
  idUsuario,
  onSuccess,
}: Props) => {
  const [selectedProdutoId, setSelectedProdutoId] = useState("");
  const [quantidadeProduzir, setQuantidadeProduzir] = useState(1);
  const [formulaLines, setFormulaLines] = useState<FormulaProducaoRead[]>([]);
  const [lotesPorInsumo, setLotesPorInsumo] = useState<Record<string, ItemEstoqueInsumo[]>>({});
  const [selectedLoteIds, setSelectedLoteIds] = useState<string[]>([]);
  const [loteProduto, setLoteProduto] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFormulaAndLotes = useCallback(async (idEstoqueProducao: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: formula } = await formulasApi.getByProduto(idEstoqueProducao);
      if (!formula || formula.length === 0) {
        setFormulaLines([]);
        setLotesPorInsumo({});
        setSelectedLoteIds([]);
        setError("Este produto não possui fórmula. Cadastre a fórmula na página Fórmulas.");
        return;
      }
      setFormulaLines(formula);
      const lotes: Record<string, ItemEstoqueInsumo[]> = {};
      for (const line of formula) {
        const { data: itens } = await productItemsApi.listByEstoqueInsumo(line.id_estoque_insumo);
        lotes[line.id_estoque_insumo] = (itens || []).filter((i) => i.quantidade > 0);
      }
      setLotesPorInsumo(lotes);
      setSelectedLoteIds(formula.map(() => ""));
    } catch (e) {
      console.error(e);
      setError("Erro ao carregar fórmula ou lotes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && selectedProdutoId) {
      loadFormulaAndLotes(selectedProdutoId);
    } else if (!open) {
      setSelectedProdutoId("");
      setQuantidadeProduzir(1);
      setFormulaLines([]);
      setLotesPorInsumo({});
      setSelectedLoteIds([]);
      setLoteProduto("");
      setObservacoes("");
      setError(null);
    }
  }, [open, selectedProdutoId, loadFormulaAndLotes]);

  const setLoteAt = (index: number, idItem: string) => {
    setSelectedLoteIds((prev) => {
      const next = [...prev];
      next[index] = idItem;
      return next;
    });
  };

  const getInsumoNome = (idEstoqueInsumo: string) =>
    insumos.find((i) => i.id === idEstoqueInsumo)?.nome ?? idEstoqueInsumo;
  const getInsumoUnidade = (idEstoqueInsumo: string) =>
    insumos.find((i) => i.id === idEstoqueInsumo)?.unidade_medida ?? "un";

  const requiredByLine = formulaLines.map(
    (line) => line.quantidade_necessaria * quantidadeProduzir
  );
  const selectedLotesOk = selectedLoteIds.every((id) => id);
  const stockOkByLine = formulaLines.every((line, i) => {
    const lotes = lotesPorInsumo[line.id_estoque_insumo] || [];
    const selected = lotes.find((l) => l.id === selectedLoteIds[i]);
    const required = requiredByLine[i];
    return selected && selected.quantidade >= required;
  });
  const canSubmit =
    selectedProdutoId &&
    quantidadeProduzir > 0 &&
    formulaLines.length > 0 &&
    selectedLotesOk &&
    stockOkByLine;

  const insumosInsuficientes = formulaLines
    .map((line, i) => {
      const lotes = lotesPorInsumo[line.id_estoque_insumo] || [];
      const selected = lotes.find((l) => l.id === selectedLoteIds[i]);
      const required = requiredByLine[i];
      if (!selected) return { nome: getInsumoNome(line.id_estoque_insumo), required, tem: 0 };
      if (selected.quantidade < required)
        return { nome: getInsumoNome(line.id_estoque_insumo), required, tem: selected.quantidade };
      return null;
    })
    .filter(Boolean) as { nome: string; required: number; tem: number }[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const producao = producoes.find((p) => p.id === selectedProdutoId);
    if (!producao) return;
    setSubmitting(true);
    setError(null);
    const obs = observacoes.trim() || undefined;
    try {
      // 1. Para cada insumo da fórmula: baixar do lote escolhido e registrar movimentação SAÍDA
      for (let i = 0; i < formulaLines.length; i++) {
        const line = formulaLines[i];
        const idItem = selectedLoteIds[i];
        const qtdConsumir = line.quantidade_necessaria * quantidadeProduzir;
        const { data: item } = await productItemsApi.getInsumoById(idItem);
        if (!item || item.quantidade < qtdConsumir) {
          throw new Error(`Lote sem quantidade suficiente para ${getInsumoNome(line.id_estoque_insumo)}.`);
        }
        await productItemsApi.updateInsumo(idItem, {
          quantidade: item.quantidade - qtdConsumir,
        });
        await movimentacoesApi.create({
          id_empresa: idEmpresa,
          id_usuario: idUsuario,
          tipo_estoque: "insumo",
          tipo_operacao: "saida",
          quantidade: qtdConsumir,
          id_item_estoque_insumo: idItem,
          motivo: "Produção",
          observacoes: obs,
        });
      }
      // 2. Criar novo lote do produto (item_estoque_producao)
      const loteFinal = loteProduto.trim() || `LOTE-${producao.codigo}-${Date.now()}`;
      const { data: novoItem } = await productItemsApi.createProducao({
        id_estoque_producao: selectedProdutoId,
        lote: loteFinal,
        data_producao: new Date().toISOString(),
        quantidade: quantidadeProduzir,
        custo_unitario: producao.custo_producao,
        quantidade_minima: 0,
      });
      if (!novoItem) throw new Error("Falha ao criar lote do produto.");
      // 3. Registrar movimentação ENTRADA do produto produzido
      await movimentacoesApi.create({
        id_empresa: idEmpresa,
        id_usuario: idUsuario,
        tipo_estoque: "producao",
        tipo_operacao: "entrada",
        quantidade: quantidadeProduzir,
        id_item_estoque_producao: novoItem.id,
        motivo: "Produção finalizada",
        observacoes: obs,
      });
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail ?? (err as Error).message;
      setError(typeof msg === "string" ? msg : "Erro ao executar produção.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] gap-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle>Produzir</DialogTitle>
          <DialogDescription>
            Escolha o produto, a quantidade e <strong>de qual lote</strong> retirar cada insumo. Ao finalizar, os ingredientes serão <strong>baixados desses lotes</strong>. Não é permitido produzir mais do que o estoque disponível no lote selecionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Produto a produzir</label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={selectedProdutoId}
              onChange={(e) => setSelectedProdutoId(e.target.value)}
            >
              <option value="">Selecione o produto...</option>
              {producoes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.unidade_medida})
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <p className="text-sm text-slate-500">Carregando fórmula e lotes...</p>
          )}

          {!loading && formulaLines.length > 0 && (
            <>
              {insumosInsuficientes.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <p className="font-medium">Estoque insuficiente</p>
                  <p className="mt-1">Não é permitido produzir mais do que o disponível no lote selecionado. Ajuste a quantidade ou escolha outro lote.</p>
                  <ul className="mt-2 list-disc list-inside">
                    {insumosInsuficientes.map((x) => (
                      <li key={x.nome}>
                        {x.nome}: precisa {x.required}, tem no lote {x.tem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quantidade a produzir</label>
                <Input
                  type="number"
                  min={0.001}
                  step="0.001"
                  value={quantidadeProduzir}
                  onChange={(e) => setQuantidadeProduzir(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">De qual lote retirar cada insumo? (será baixado ao finalizar)</h3>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-600">
                      <tr>
                        <th className="py-2 px-3 font-medium">Insumo</th>
                        <th className="py-2 px-3 font-medium">Qtd. necessária</th>
                        <th className="py-2 px-3 font-medium">Lote</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formulaLines.map((line, i) => {
                        const required = line.quantidade_necessaria * quantidadeProduzir;
                        const lotes = lotesPorInsumo[line.id_estoque_insumo] || [];
                        const selected = lotes.find((l) => l.id === selectedLoteIds[i]);
                        const hasEnough = selected && selected.quantidade >= required;
                        return (
                          <tr key={line.id} className="text-slate-700">
                            <td className="py-2 px-3">{getInsumoNome(line.id_estoque_insumo)}</td>
                            <td className="py-2 px-3 font-mono">{required} {getInsumoUnidade(line.id_estoque_insumo)}</td>
                            <td className="py-2 px-3">
                              <select
                                className="flex h-9 w-full max-w-[220px] rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                                value={selectedLoteIds[i]}
                                onChange={(e) => setLoteAt(i, e.target.value)}
                              >
                                <option value="">Selecione o lote...</option>
                                {lotes.map((l) => (
                                  <option
                                    key={l.id}
                                    value={l.id}
                                    disabled={l.quantidade < required}
                                  >
                                    {l.lote} — disp. {l.quantidade}
                                    {l.quantidade < required ? " (insuficiente)" : ""}
                                  </option>
                                ))}
                                {lotes.length === 0 && (
                                  <option value="" disabled>Nenhum lote com estoque</option>
                                )}
                              </select>
                              {selectedLoteIds[i] && !hasEnough && (
                                <p className="text-xs text-destructive mt-0.5">Quantidade insuficiente neste lote.</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Lote do produto final (opcional)</label>
                <Input
                  placeholder="Ex: LOTE-SUCO-001"
                  value={loteProduto}
                  onChange={(e) => setLoteProduto(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Observações (opcional)</label>
                <Input
                  placeholder="Ex: Produção 30/01/2025"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </>
          )}

          {!loading && selectedProdutoId && formulaLines.length === 0 && !error && (
            <p className="text-sm text-slate-500">Nenhuma fórmula encontrada para este produto.</p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || submitting}
              title={
                !selectedLotesOk
                  ? "Selecione o lote de cada insumo"
                  : insumosInsuficientes.length > 0
                    ? "Estoque insuficiente nos lotes selecionados"
                    : undefined
              }
            >
              {submitting ? "Executando..." : "Executar produção"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
