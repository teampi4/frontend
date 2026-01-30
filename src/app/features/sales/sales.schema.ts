import { z } from "zod";

export const saleUpdateSchema = z.object({
  numero_venda: z.string().min(1, "Informe o número da venda."),
  data_venda: z.string().min(1, "Informe a data da venda."),
  status: z.string().min(1, "Informe o status."),
  id_cliente: z.string().min(1, "Informe o cliente."),
  id_forma_pagamento: z.string().min(1, "Informe a forma de pagamento."),
  parcelas: z.coerce.number().min(1, "Informe o número de parcelas."),
  desconto: z.coerce.number().min(0, "O desconto deve ser maior ou igual a zero."),
  observacoes: z.string().optional(),
});

export type SaleUpdateFormValues = z.infer<typeof saleUpdateSchema>;
