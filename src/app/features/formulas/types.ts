// --- MODELO CONCEITUAL ---
// Fórmula relaciona-se a estoque_producao (produção). Cada registro = UM ingrediente de UM produto de produção.
// id_estoque_producao + id_estoque_insumo + quantidade_necessaria. Sem lista_de_insumos no backend.

// --- TIPOS DE RESPOSTA DA API ---

// UM registro = UM ingrediente de UM produto de produção (como vem do banco/GET).
export interface FormulaProducaoRead {
  id: string;
  id_estoque_producao: string;
  id_estoque_insumo: string;
  quantidade_necessaria: number;
  observacao?: string | null;
}

// Payload para criar UM registro (POST). Uma requisição por ingrediente. Relaciona a estoque_producao.
export interface FormulaProducaoCreate {
  id_estoque_producao: string;
  id_estoque_insumo: string;
  quantidade_necessaria: number;
  observacao?: string;
}

// O objeto para atualização (PUT)
export interface FormulaProducaoUpdate {
  quantidade_necessaria?: number;
  observacao?: string;
}

// --- TIPOS AUXILIARES (apenas frontend) ---

// Agrupamento por produto para exibição: custo = soma(quantidade_necessaria × custo_unitario) do insumo.
export interface FormulaView {
  id_produto: string;
  nome_produto: string;
  unidade_medida: string;
  qtd_ingredientes: number;
  custo_total: number;
}

// Usado para preencher o Select de Produtos
export interface ProdutoSelect {
  id: string;
  nome: string;
  unidade_medida: string;
}

// Usado para preencher o Select de Insumos (precisa do custo para cálculos)
export interface InsumoSelect {
  id: string;
  nome: string;
  unidade_medida: string;
  custo_unitario: number; 
}