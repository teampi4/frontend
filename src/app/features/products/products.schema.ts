import { z } from "zod";

export const productSchema = z.object({
  codigo: z.string().min(1, "Informe o código."),
  nome: z.string().min(1, "Informe o nome."),
  unidade_medida: z.string().min(1, "Informe a unidade de medida."),
  descricao: z.string().optional(),
  custo_producao: z.coerce.number().min(0, "O custo deve ser maior ou igual a zero."),
  preco_venda: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero."),
  ativo: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
