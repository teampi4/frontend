import { z } from "zod";

export const producaoSchema = z.object({
  codigo: z.string().min(1, "Informe o código."),
  nome: z.string().min(1, "Informe o nome."),
  unidade_medida: z.string().min(1, "Informe a unidade de medida."),
  descricao: z.string().optional().nullable(),
  custo_producao: z.coerce.number().min(0, "O custo deve ser maior ou igual a zero."),
  ativo: z.boolean().default(true),
});

export type ProducaoFormValues = z.infer<typeof producaoSchema>;
