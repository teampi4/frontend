import { z } from "zod";

export const insumoSchema = z.object({
  codigo: z.string().min(1, "Informe o código."),
  nome: z.string().min(1, "Informe o nome."),
  unidade_medida: z.string().min(1, "Informe a unidade de medida."),
  descricao: z.string().optional(),
  fornecedor: z.string().optional(),
  custo_unitario: z.coerce.number().min(0, "O custo deve ser maior ou igual a zero."),
  ativo: z.boolean().optional(),
});

export type InsumoFormValues = z.infer<typeof insumoSchema>;
