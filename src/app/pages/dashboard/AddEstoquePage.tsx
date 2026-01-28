import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { httpClient } from "@/lib/http/axios";
import { toast } from "sonner";
import { getAuth } from "@/hooks/auth/useAuth";
import { useHeader } from "@/hooks/useHeader";

const produtoSchema = z.object({
  tipo_estoque: z.enum(["produto", "insumo", "producao"], {
    required_error: "Selecione o tipo de estoque.",
  }),
  codigo: z.string().min(1, "Informe o código do produto."),
  nome: z.string().min(1, "Informe o nome do produto."),
  unidade_medida: z.string().min(1, "Informe a unidade de medida."),
  descricao: z.string().optional(),
  custo_producao: z.coerce.number().min(0, "Custo de produção não pode ser negativo."),
  preco_venda: z.coerce.number().min(0, "Preço de venda não pode ser negativo."),
});

const loteSchema = z.object({
  lote: z.string().min(1, "Informe o lote."),
  data_producao: z.string().min(1, "Informe a data de produção."),
  data_validade: z.string().optional(),
  quantidade: z.coerce.number().min(1, "A quantidade deve ser maior que 0."),
  custo_unitario: z.coerce.number().min(0, "Custo unitário não pode ser negativo."),
  quantidade_minima: z.coerce.number().min(0, "Quantidade mínima não pode ser negativa."),
  localizacao: z.string().optional(),
  observacoes: z.string().optional(),
}).refine(
  (data) => !data.data_validade || new Date(data.data_validade) > new Date(data.data_producao),
  {
    message: "A data de validade deve ser posterior à data de produção.",
    path: ["data_validade"],
  }
);

type ProdutoValues = z.infer<typeof produtoSchema>;
type LoteValues = z.infer<typeof loteSchema>;

export const AddEstoquePage = () => {
  const { usuario } = getAuth();
  const navigate = useNavigate();
  const { setHeader } = useHeader();
  const [step, setStep] = useState(1);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHeader({
      pageName: "Adicionar Estoque",
      pathPage: null,
      actions: null,
    });

    return () => {
      setHeader({
        pageName: "",
        pathPage: null,
        actions: null,
      });
    };
  }, [setHeader]);

  const produtoForm = useForm<ProdutoValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      tipo_estoque: "produto",
      codigo: "",
      nome: "",
      unidade_medida: "",
      descricao: "",
      custo_producao: 0,
      preco_venda: 0,
    },
  });

  const loteForm = useForm<LoteValues>({
    resolver: zodResolver(loteSchema),
    defaultValues: {
      lote: "",
      data_producao: new Date().toISOString().split("T")[0],
      data_validade: "",
      quantidade: "1" as any,
      custo_unitario: "0" as any,
      quantidade_minima: "0" as any,
      localizacao: "",
      observacoes: "",
    },
  });

  const handleProdutoSubmit = async (values: ProdutoValues) => {
    if (!usuario?.id_empresa) {
      toast.error("Usuário sem empresa vinculada.");
      return;
    }

    setIsLoading(true);

    try {
      const endpointMap: Record<string, string> = {
        produto: "/estoque-produtos",
        insumo: "/estoque-insumos",
        producao: "/estoque-producoes",
      };

      const endpoint = endpointMap[values.tipo_estoque];
      const { tipo_estoque, ...payload } = values;

      const response = await httpClient.post(endpoint, {
        ...payload,
        id_empresa: usuario.id_empresa,
      });

      setProdutoId(response.data.id);
      toast.success("Produto cadastrado com sucesso!");
      loteForm.reset();
      setStep(2);
    } catch (err: unknown) {
      console.error("Erro ao cadastrar produto:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Erro ao cadastrar produto.");
      } else {
        toast.error("Erro ao cadastrar produto.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoteSubmit = async (values: LoteValues) => {
    if (!produtoId) {
      toast.error("Produto não foi criado. Tente novamente.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...values,
        id_estoque_produto: produtoId,
        data_producao: new Date(values.data_producao).toISOString(),
        data_validade: values.data_validade ? new Date(values.data_validade).toISOString() : null,
      };

      await httpClient.post("/item-estoque-produtos", payload);
      
      toast.success("Estoque cadastrado com sucesso!");

      setTimeout(() => {
        navigate("/dashboard/inventario");
      }, 1500);
    } catch (err: unknown) {
      console.error("Erro ao cadastrar lote:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Erro ao cadastrar lote.");
      } else {
        toast.error("Erro ao cadastrar lote.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 max-w-2xl">
        <p className="text-sm text-slate-500">
          {step === 1 
            ? "Cadastre um novo produto informando código, nome, unidade de medida e preços."
            : "Cadastre um lote para o produto, informando quantidade, datas e localização."
          }
        </p>
      </div>

      {step === 1 ? (
        <form key="form-produto" onSubmit={produtoForm.handleSubmit(handleProdutoSubmit)} className="space-y-6">
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Controller
                control={produtoForm.control}
                name="tipo_estoque"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Tipo de Estoque</FieldLabel>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      aria-invalid={fieldState.invalid}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="produto">Produto</option>
                      <option value="insumo">Insumo</option>
                      <option value="producao">Produção</option>
                    </select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <Controller
                control={produtoForm.control}
                name="codigo"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Código do Produto</FieldLabel>
                    <Input 
                      {...field} 
                      placeholder="Ex: SUCO-LAR-1KG"
                      aria-invalid={fieldState.invalid} 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <Controller
                control={produtoForm.control}
                name="nome"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Nome do Produto</FieldLabel>
                    <Input 
                      {...field} 
                      placeholder="Ex: Suco de Laranja em Pó - 1kg"
                      aria-invalid={fieldState.invalid} 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={produtoForm.control}
              name="unidade_medida"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Unidade de Medida</FieldLabel>
                  <Input 
                    {...field} 
                    placeholder="Ex: UN, KG, LT"
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={produtoForm.control}
              name="custo_producao"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Custo de Produção</FieldLabel>
                  <Input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={produtoForm.control}
              name="preco_venda"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Preço de Venda</FieldLabel>
                  <Input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="sm:col-span-2">
              <Controller
                control={produtoForm.control}
                name="descricao"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Descrição (Opcional)</FieldLabel>
                    <Input 
                      {...field} 
                      placeholder="Ex: Suco de laranja em pó, rende 10 litros"
                      aria-invalid={fieldState.invalid} 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate("/dashboard/inventario")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="cursor-pointer bg-[#2A64E8] hover:bg-[#1d4ed8]"
              disabled={isLoading || produtoForm.formState.isSubmitting}
            >
              {isLoading ? "Cadastrando..." : "Próximo"}
            </Button>
          </div>
        </form>
      ) : (
        <form key="form-lote" onSubmit={loteForm.handleSubmit(handleLoteSubmit)} className="space-y-6">
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Controller
                control={loteForm.control}
                name="lote"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Lote</FieldLabel>
                    <Input 
                      {...field} 
                      placeholder="Ex: LOTE-2026-001"
                      aria-invalid={fieldState.invalid} 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={loteForm.control}
              name="data_producao"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Data de Produção</FieldLabel>
                  <Input 
                    type="date" 
                    {...field} 
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={loteForm.control}
              name="data_validade"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Data de Validade (Opcional)</FieldLabel>
                  <Input 
                    type="date" 
                    {...field} 
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={loteForm.control}
              name="quantidade"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Quantidade</FieldLabel>
                  <Input 
                    type="number" 
                    min={1} 
                    {...field} 
                    placeholder="0"
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={loteForm.control}
              name="custo_unitario"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Custo Unitário</FieldLabel>
                  <Input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    {...field} 
                    placeholder="0.00"
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={loteForm.control}
              name="quantidade_minima"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Quantidade Mínima</FieldLabel>
                  <Input 
                    type="number" 
                    min={0} 
                    {...field} 
                    placeholder="0"
                    aria-invalid={fieldState.invalid} 
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="sm:col-span-2">
              <Controller
                control={loteForm.control}
                name="localizacao"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Localização (Opcional)</FieldLabel>
                    <Input 
                      {...field} 
                      placeholder="Ex: EST-FIN-A1"
                      aria-invalid={fieldState.invalid} 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <Controller
                control={loteForm.control}
                name="observacoes"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Observações (Opcional)</FieldLabel>
                    <Input 
                      {...field} 
                      placeholder="Ex: Produto embalado e pronto para venda"
                      aria-invalid={fieldState.invalid} 
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setStep(1)}
              disabled={isLoading}
            >
              Voltar
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate("/dashboard/inventario")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="cursor-pointer bg-[#2A64E8] hover:bg-[#1d4ed8]"
              disabled={isLoading || loteForm.formState.isSubmitting}
            >
              {isLoading ? "Cadastrando..." : "Finalizar"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
