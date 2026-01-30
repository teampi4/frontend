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
import type { ItemEstoqueProducaoCreate } from "@/app/features/product-items/types";
import type { EstoqueProducao } from "@/app/features/producao/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
  producoes: EstoqueProducao[];
};

/** Converte valor de datetime-local para ISO string (YYYY-MM-DDTHH:mm:ss) para a API */
const toDateTimeIso = (value: string): string => {
  if (!value?.trim()) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const defaultDateTimeLocal = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const CadastrarLoteProducaoDialog = ({
  open,
  onOpenChange,
  onSuccess,
  producoes,
}: Props) => {
  const [idEstoqueProducao, setIdEstoqueProducao] = useState("");
  const [lote, setLote] = useState("");
  const [dataProducao, setDataProducao] = useState("");
  const [dataValidade, setDataValidade] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [custoUnitario, setCustoUnitario] = useState("");
  const [quantidadeMinima, setQuantidadeMinima] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setIdEstoqueProducao(producoes[0]?.id ?? "");
      setLote("");
      setDataProducao(defaultDateTimeLocal());
      setDataValidade("");
      setQuantidade("");
      setCustoUnitario("");
      setQuantidadeMinima("");
      setLocalizacao("");
      setObservacoes("");
      setErrors({});
    }
  }, [open, producoes]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!idEstoqueProducao) errs.id_estoque_producao = "Selecione a produção.";
    if (!lote.trim()) errs.lote = "Informe o lote.";
    if (!dataProducao.trim()) errs.data_producao = "Informe a data de produção.";
    const qty = parseFloat(quantidade);
    if (isNaN(qty) || qty < 0) errs.quantidade = "Quantidade inválida.";
    const custo = parseFloat(custoUnitario);
    if (isNaN(custo) || custo < 0) errs.custo_unitario = "Custo unitário inválido.";
    const qtyMin = parseFloat(quantidadeMinima);
    if (isNaN(qtyMin) || qtyMin < 0) errs.quantidade_minima = "Quantidade mínima inválida.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const data: ItemEstoqueProducaoCreate = {
        id_estoque_producao: idEstoqueProducao,
        lote: lote.trim(),
        data_producao: toDateTimeIso(dataProducao),
        quantidade: parseFloat(quantidade),
        custo_unitario: parseFloat(custoUnitario),
        data_validade: dataValidade.trim() ? toDateTimeIso(dataValidade) : null,
        quantidade_minima: parseFloat(quantidadeMinima) || 0,
        localizacao: localizacao.trim() || null,
        observacoes: observacoes.trim() || null,
      };
      await productItemsApi.createProducao(data);
      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao cadastrar lote:", err);
      setErrors({ submit: "Não foi possível cadastrar o lote. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg gap-6">
        <DialogHeader>
          <DialogTitle>Cadastrar lote (item_estoque_producao)</DialogTitle>
          <DialogDescription>
            Preencha todos os campos do lote de produção.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <ul className="list-disc list-inside space-y-0.5">
                {Object.entries(errors).map(([k, msg]) => (
                  <li key={k}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Produção (id_estoque_producao)</FieldLabel>
                <select
                  id="id_estoque_producao"
                  name="id_estoque_producao"
                  value={idEstoqueProducao}
                  onChange={(e) => setIdEstoqueProducao(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-invalid={!!errors.id_estoque_producao}
                >
                  <option value="">Selecione a produção</option>
                  {producoes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} – {p.nome}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field>
              <FieldLabel>Lote</FieldLabel>
              <Input
                id="lote"
                name="lote"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                placeholder="Ex: LOTE-MIX-LAR-2025-001"
                aria-invalid={!!errors.lote}
              />
            </Field>
            <Field>
              <FieldLabel>Data de produção</FieldLabel>
              <Input
                id="data_producao"
                name="data_producao"
                type="datetime-local"
                value={dataProducao}
                onChange={(e) => setDataProducao(e.target.value)}
                aria-invalid={!!errors.data_producao}
              />
            </Field>
            <Field>
              <FieldLabel>Quantidade</FieldLabel>
              <Input
                id="quantidade"
                name="quantidade"
                type="number"
                step="0.01"
                min="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 200"
                aria-invalid={!!errors.quantidade}
              />
            </Field>
            <Field>
              <FieldLabel>Custo unitário (R$)</FieldLabel>
              <Input
                id="custo_unitario"
                name="custo_unitario"
                type="number"
                step="0.01"
                min="0"
                value={custoUnitario}
                onChange={(e) => setCustoUnitario(e.target.value)}
                placeholder="Ex: 12.5"
                aria-invalid={!!errors.custo_unitario}
              />
            </Field>
            <Field>
              <FieldLabel>Data validade (opcional)</FieldLabel>
              <Input
                id="data_validade"
                name="data_validade"
                type="datetime-local"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Quantidade mínima</FieldLabel>
              <Input
                id="quantidade_minima"
                name="quantidade_minima"
                type="number"
                step="0.01"
                min="0"
                value={quantidadeMinima}
                onChange={(e) => setQuantidadeMinima(e.target.value)}
                placeholder="Ex: 20"
                aria-invalid={!!errors.quantidade_minima}
              />
            </Field>
            <Field>
              <FieldLabel>Localização (opcional)</FieldLabel>
              <Input
                id="localizacao"
                name="localizacao"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Ex: PROD-01"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field>
                <FieldLabel>Observações (opcional)</FieldLabel>
                <Input
                  id="observacoes"
                  name="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Produção 20/01/2025"
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Cadastrando..." : "Cadastrar lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
