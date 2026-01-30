export type PerfilUsuario = "admin" | "gerente" | "operador" | "vendedor";

export type Usuario = {
  id: string;
  id_empresa?: string | null;
  login: string;
  nome: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  data_criacao: string;
};

export type UsuarioCreate = {
  id_empresa?: string | null;
  login: string;
  nome: string;
  perfil: PerfilUsuario;
  senha: string;
};

export type UsuarioUpdate = {
  login?: string;
  nome?: string;
  perfil?: PerfilUsuario;
  senha?: string;
  ativo?: boolean;
};
