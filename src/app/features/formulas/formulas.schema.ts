// src/features/formulas/formulas.schema.ts
import { z } from "zod";

// Modelo: cada ingrediente vira UM registro na API (um POST por ingrediente).
// O campo "ingredientes" existe só no formulário (UX); o backend NÃO recebe lista.

// Validação de uma linha (um ingrediente = um registro futuro).
export const formulaItemSchema = z.object({
  id_estoque_insumo: z.string({ required_error: "Selecione um insumo" }).min(1, "Selecione um insumo"),
  quantidade_necessaria: z.coerce
    .number({ invalid_type_error: "Qtd inválida" })
    .min(0.0001, "A quantidade deve ser maior que 0"),
  observacao: z.string().optional(),
});

// Formulário: produto de produção (estoque_producao) + array de ingredientes. Ao salvar = múltiplos POSTs, um por ingrediente.
export const FormulaFormSchema = z.object({
  id_estoque_producao: z.string({ required_error: "Selecione o produto final" }).min(1, "Selecione o produto"),
  ingredientes: z.array(formulaItemSchema).min(1, "Adicione pelo menos 1 ingrediente à fórmula"),
});

export type FormulaFormValues = z.infer<typeof FormulaFormSchema>;