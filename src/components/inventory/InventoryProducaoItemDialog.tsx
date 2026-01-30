import { useState, useEffect } from "react";
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
import { productItemsApi } from "@/app/features/product-items/api/product-items.api";
import type { ItemEstoqueProducao, ItemEstoqueProducaoCreate, ItemEstoqueProducaoUpdate } from "@/app/features/product-items/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
  idEstoqueProducao: string;
  editingItem?: ItemEstoqueProducao | null;
};

const formatDateLocal = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toDateTimeForApi = (dateStr: string) =>
  dateStr ? `${dateStr}T00:00:00` : dateStr;

export const InventoryProducaoItemDialog = ({ open, onOpenChange, onSuccess, idEstoqueProducao, editingItem }: Props) => {
  const [lote, setLote] = useState("");
  const [dataProducao, setDataProducao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [quantidade, setQuantidade] = useState("0");
  const [quantidadeMinima, setQuantidadeMinima] = useState("0");
  const [custoUnitario, setCustoUnitario] = useState("0");
  const [localizacao, setLocalizacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setLote(editingItem.lote);
        setDataProducao(formatDateLocal(editingItem.data_producao));
        setDataValidade(formatDateLocal(editingItem.data_validade));
        setQuantidade(String(editingItem.quantidade));
        setQuantidadeMinima(String(editingItem.quantidade_minima));
        setCustoUnitario(String(editingItem.custo_unitario));
        setLocalizacao(editingItem.localizacao ?? "");
        setObservacoes(editingItem.observacoes ?? "");
      } else {
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, "0");
        setLote("");
        setDataProducao(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
        setDataValidade("");
        setQuantidade("0");
        setQuantidadeMinima("0");
        setCustoUnitario("0");
        setLocalizacao("");
        setObservacoes("");
      }
      setErrors({});
    }
  }, [open, editingItem]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!lote.trim()) errs.lote = "Informe o lote.";
    if (!dataProducao.trim()) errs.dataProducao = "Informe a data de produção.";
    const qty = parseFloat(quantidade);
    if (isNaN(qty) || qty < 0) errs.quantidade = "Quantidade inválida.";
    const custo = parseFloat(custoUnitario);
    if (isNaN(custo) || custo < 0) errs.custoUnitario = "Custo inválido.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (editingItem) {
        const data: ItemEstoqueProducaoUpdate = {
          lote: lote.trim(),
          data_producao: dataProducao ? toDateTimeForApi(dataProducao) : undefined,
          data_validade: dataValidade ? toDateTimeForApi(dataValidade) : null,
          quantidade: parseFloat(quantidade),
          quantidade_minima: parseFloat(quantidadeMinima) || 0,
          custo_unitario: parseFloat(custoUnitario),
          localizacao: localizacao.trim() || null,
          observacoes: observacoes.trim() || null,
        };
        await productItemsApi.updateProducao(editingItem.id, data);
      } else {
        const data: ItemEstoqueProducaoCreate = {
          id_estoque_producao: idEstoqueProducao,
          lote: lote.trim(),
          data_producao: toDateTimeForApi(dataProducao),
          data_validade: dataValidade ? toDateTimeForApi(dataValidade) : null,
          quantidade: parseFloat(quantidade),
          custo_unitario: parseFloat(custoUnitario),
          quantidade_minima: parseFloat(quantidadeMinima) || 0,
          localizacao: localizacao.trim() || null,
          observacoes: observacoes.trim() || null,
        };
        await productItemsApi.createProducao(data);
      }
      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao salvar item:", err);
      setErrors({ submit: "Não foi possível salvar. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Editar lote de produção" : "Novo lote de produção"}</DialogTitle>
          <DialogDescription>Gerencie a quantidade e dados do lote.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <ul className="list-disc list-inside space-y-0.5">
                {Object.entries(errors).map(([k, msg]) => (
                  <li key={k}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Lote</FieldLabel>
              <Input value={lote} onChange={(e) => setLote(e.target.value)} placeholder="LOTE-001" />
            </Field>
            <Field>
              <FieldLabel>Data de produção</FieldLabel>
              <Input type="date" value={dataProducao} onChange={(e) => setDataProducao(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Quantidade</FieldLabel>
              <Input type="number" step="0.01" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Custo unitário (R$)</FieldLabel>
              <Input type="number" step="0.01" min="0" value={custoUnitario} onChange={(e) => setCustoUnitario(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Quantidade mínima</FieldLabel>
              <Input type="number" step="0.01" min="0" value={quantidadeMinima} onChange={(e) => setQuantidadeMinima(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Data validade (opcional)</FieldLabel>
              <Input type="date" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Localização (opcional)</FieldLabel>
                <Input value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} placeholder="Ex: PROD-01" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Observações (opcional)</FieldLabel>
                <Input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
