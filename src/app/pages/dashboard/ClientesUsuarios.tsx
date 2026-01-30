import { useCallback, useEffect, useState } from "react";
import { useHeader } from "@/hooks/useHeader";
import { getAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Users, UserCircle } from "lucide-react";
import { clientesApi } from "@/app/features/clientes/api/clientes.api";
import { usuariosApi } from "@/app/features/usuarios/api/usuarios.api";
import type { Cliente } from "@/app/features/clientes/types";
import type { Usuario } from "@/app/features/usuarios/types";
import type { ClienteCreate, ClienteUpdate } from "@/app/features/clientes/types";
import { ClienteDialog } from "@/components/clientes/ClienteDialog";
import { UsuarioDialog } from "@/components/usuarios/UsuarioDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClientValues } from "@/components/layout/sidebar-admin-dialogs.schema";

type TabId = "clientes" | "usuarios";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const ClientesUsuarios = () => {
  const { setHeader } = useHeader();
  const { usuario } = getAuth();
  const idEmpresa = usuario?.id_empresa != null ? String(usuario.id_empresa) : null;

  const [activeTab, setActiveTab] = useState<TabId>("clientes");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesLoading, setClientesLoading] = useState(false);
  const [isClienteDialogOpen, setIsClienteDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeletingCliente, setIsDeletingCliente] = useState(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);
  const [isUsuarioDialogOpen, setIsUsuarioDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [isDeletingUsuario, setIsDeletingUsuario] = useState(false);

  const loadClientes = useCallback(async () => {
    if (!idEmpresa) return;
    try {
      setClientesLoading(true);
      const { data } = await clientesApi.listByEmpresa(idEmpresa);
      setClientes(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar clientes:", err);
      toast.error("Não foi possível carregar os clientes.");
    } finally {
      setClientesLoading(false);
    }
  }, [idEmpresa]);

  const loadUsuarios = useCallback(async () => {
    if (!idEmpresa) return;
    try {
      setUsuariosLoading(true);
      const { data } = await usuariosApi.listByEmpresa(idEmpresa);
      setUsuarios(data ?? []);
    } catch (err: unknown) {
      console.error("Erro ao carregar usuários:", err);
      toast.error("Não foi possível carregar os usuários.");
    } finally {
      setUsuariosLoading(false);
    }
  }, [idEmpresa]);

  useEffect(() => {
    if (activeTab === "clientes") loadClientes();
    else loadUsuarios();
  }, [activeTab, loadClientes, loadUsuarios]);

  useEffect(() => {
    setHeader({
      pageName: "Clientes e usuários",
      pathPage: "Início > Clientes e usuários",
      actions: idEmpresa
        ? [
            {
              type: "button",
              label: activeTab === "clientes" ? "Novo cliente" : "Novo usuário",
              icon: activeTab === "clientes" ? <UserCircle className="h-4 w-4" /> : <Users className="h-4 w-4" />,
              variant: "success",
              onClick: () => {
                if (activeTab === "clientes") {
                  setEditingCliente(null);
                  setIsClienteDialogOpen(true);
                } else {
                  setEditingUsuario(null);
                  setIsUsuarioDialogOpen(true);
                }
              },
            },
          ]
        : null,
    });
    return () => setHeader({ pageName: "", pathPage: null, actions: null });
  }, [setHeader, idEmpresa, activeTab]);

  const handleClienteSubmit = async (values: ClientValues & { id_empresa?: string }) => {
    const empId = values.id_empresa ?? idEmpresa;
    if (!empId) {
      toast.error("Usuário sem empresa vinculada.");
      return;
    }
    if (editingCliente) {
      try {
        const payload: ClienteUpdate = {
          tipo_pessoa: values.tipo_pessoa as "PF" | "PJ",
          cpf_cnpj: values.cpf_cnpj,
          contato_nome: values.contato_nome ?? "",
          razao_social: values.razao_social || null,
          nome_fantasia: values.nome_fantasia || null,
          telefone: values.telefone || null,
          celular: values.celular || null,
          email: values.email || null,
          cep: values.cep || null,
          logradouro: values.logradouro || null,
          numero: values.numero || null,
          complemento: values.complemento || null,
          bairro: values.bairro || null,
          cidade: values.cidade || null,
          estado: values.estado || null,
          observacoes: values.observacoes || null,
          ativo: values.ativo ?? editingCliente.ativo,
        };
        const { data } = await clientesApi.update(editingCliente.id, payload);
        if (data) setClientes((prev) => prev.map((c) => (c.id === data.id ? data : c)));
        toast.success("Cliente atualizado com sucesso.");
        setEditingCliente(null);
      } catch (err: unknown) {
        console.error("Erro ao atualizar cliente:", err);
        toast.error("Não foi possível atualizar o cliente.");
      }
      return;
    }
    try {
      const payload: ClienteCreate = {
        id_empresa: empId,
        tipo_pessoa: values.tipo_pessoa as "PF" | "PJ",
        cpf_cnpj: values.cpf_cnpj,
        contato_nome: values.contato_nome ?? "",
        razao_social: values.razao_social || null,
        nome_fantasia: values.nome_fantasia || null,
        telefone: values.telefone || null,
        celular: values.celular || null,
        email: values.email || null,
        cep: values.cep || null,
        logradouro: values.logradouro || null,
        numero: values.numero || null,
        complemento: values.complemento || null,
        bairro: values.bairro || null,
        cidade: values.cidade || null,
        estado: values.estado || null,
        observacoes: values.observacoes || null,
      };
      const { data } = await clientesApi.create(payload);
      if (data) setClientes((prev) => [data, ...prev]);
      toast.success("Cliente cadastrado com sucesso.");
    } catch (err: unknown) {
      console.error("Erro ao cadastrar cliente:", err);
      toast.error("Não foi possível cadastrar o cliente.");
    }
  };

  const handleUsuarioSubmit = async (values: {
    login: string;
    nome: string;
    perfil: "admin" | "gerente" | "operador" | "vendedor";
    senha?: string;
    ativo?: boolean;
  }) => {
    if (editingUsuario) {
      try {
        const payload: { login?: string; nome?: string; perfil?: "admin" | "gerente" | "operador" | "vendedor"; senha?: string; ativo?: boolean } = {
          login: values.login,
          nome: values.nome,
          perfil: values.perfil,
          ativo: values.ativo ?? editingUsuario.ativo,
        };
        if (values.senha?.trim()) payload.senha = values.senha;
        const { data } = await usuariosApi.update(editingUsuario.id, payload);
        if (data) setUsuarios((prev) => prev.map((u) => (u.id === data.id ? data : u)));
        toast.success("Usuário atualizado com sucesso.");
        setEditingUsuario(null);
      } catch (err: unknown) {
        console.error("Erro ao atualizar usuário:", err);
        toast.error("Não foi possível atualizar o usuário.");
      }
      return;
    }
    if (!values.senha?.trim()) {
      toast.error("Informe a senha para novo usuário.");
      return;
    }
    if (!idEmpresa) {
      toast.error("Usuário sem empresa vinculada.");
      return;
    }
    try {
      const { data } = await usuariosApi.create({
        id_empresa: idEmpresa,
        login: values.login,
        nome: values.nome,
        perfil: values.perfil,
        senha: values.senha,
      });
      if (data) setUsuarios((prev) => [data, ...prev]);
      toast.success("Usuário cadastrado com sucesso.");
    } catch (err: unknown) {
      console.error("Erro ao cadastrar usuário:", err);
      toast.error("Não foi possível cadastrar o usuário.");
    }
  };

  const handleConfirmDeleteCliente = async () => {
    if (!clienteToDelete) return;
    try {
      setIsDeletingCliente(true);
      await clientesApi.delete(clienteToDelete.id);
      setClientes((prev) => prev.filter((c) => c.id !== clienteToDelete.id));
      toast.success("Cliente excluído com sucesso.");
      setClienteToDelete(null);
    } catch (err: unknown) {
      console.error("Erro ao excluir cliente:", err);
      toast.error("Não foi possível excluir o cliente.");
    } finally {
      setIsDeletingCliente(false);
    }
  };

  const handleConfirmDeleteUsuario = async () => {
    if (!usuarioToDelete) return;
    try {
      setIsDeletingUsuario(true);
      await usuariosApi.delete(usuarioToDelete.id);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuarioToDelete.id));
      toast.success("Usuário excluído com sucesso.");
      setUsuarioToDelete(null);
    } catch (err: unknown) {
      console.error("Erro ao excluir usuário:", err);
      toast.error("Não foi possível excluir o usuário.");
    } finally {
      setIsDeletingUsuario(false);
    }
  };

  if (!idEmpresa) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Usuário sem empresa vinculada. Entre em contato com o administrador.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("clientes")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "clientes"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Clientes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("usuarios")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "usuarios"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Usuários
        </button>
      </div>

      {activeTab === "clientes" && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Clientes</h2>
            <p className="text-sm text-slate-500">Clientes vinculados à empresa.</p>
          </div>
          {clientesLoading ? (
            <div className="text-sm text-slate-500">Carregando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="text-sm text-slate-500">
              Nenhum cliente cadastrado. Clique em Novo cliente para cadastrar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 text-left text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Tipo</th>
                    <th className="py-2 pr-4 font-medium">CPF/CNPJ</th>
                    <th className="py-2 pr-4 font-medium">Contato</th>
                    <th className="py-2 pr-4 font-medium">Razão social / Nome</th>
                    <th className="py-2 pr-4 font-medium">E-mail</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Cadastro</th>
                    <th className="py-3 pr-4 pl-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientes.map((c) => (
                    <tr key={c.id} className="text-slate-700">
                      <td className="py-2 pr-4">{c.tipo_pessoa}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{c.cpf_cnpj}</td>
                      <td className="py-2 pr-4">{c.contato_nome}</td>
                      <td className="py-2 pr-4">{c.razao_social || c.nome_fantasia || "-"}</td>
                      <td className="py-2 pr-4 text-slate-500">{c.email ?? "-"}</td>
                      <td className="py-2 pr-4">
                        <span className={c.ativo ? "text-emerald-600" : "text-slate-400"}>
                          {c.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{formatDate(c.data_cadastro)}</td>
                      <td className="py-3 pr-4 pl-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCliente(c);
                              setIsClienteDialogOpen(true);
                            }}
                            className="h-8 px-3"
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setClienteToDelete(c)}
                            className="h-8 px-3"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "usuarios" && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Usuários</h2>
            <p className="text-sm text-slate-500">Usuários vinculados à empresa.</p>
          </div>
          {usuariosLoading ? (
            <div className="text-sm text-slate-500">Carregando usuários...</div>
          ) : usuarios.length === 0 ? (
            <div className="text-sm text-slate-500">
              Nenhum usuário cadastrado. Clique em Novo usuário para cadastrar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 text-left text-slate-500">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Login</th>
                    <th className="py-2 pr-4 font-medium">Nome</th>
                    <th className="py-2 pr-4 font-medium">Perfil</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Cadastro</th>
                    <th className="py-3 pr-4 pl-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="text-slate-700">
                      <td className="py-2 pr-4 font-mono text-xs">{u.login}</td>
                      <td className="py-2 pr-4">{u.nome}</td>
                      <td className="py-2 pr-4 capitalize">{u.perfil}</td>
                      <td className="py-2 pr-4">
                        <span className={u.ativo ? "text-emerald-600" : "text-slate-400"}>
                          {u.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-500">{formatDate(u.data_criacao)}</td>
                      <td className="py-3 pr-4 pl-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUsuario(u);
                              setIsUsuarioDialogOpen(true);
                            }}
                            className="h-8 px-3"
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setUsuarioToDelete(u)}
                            className="h-8 px-3"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ClienteDialog
        open={isClienteDialogOpen}
        onOpenChange={(open) => {
          setIsClienteDialogOpen(open);
          if (!open) setEditingCliente(null);
        }}
        idEmpresa={idEmpresa}
        editingCliente={editingCliente}
        onSubmit={handleClienteSubmit}
      />

      <UsuarioDialog
        open={isUsuarioDialogOpen}
        onOpenChange={(open) => {
          setIsUsuarioDialogOpen(open);
          if (!open) setEditingUsuario(null);
        }}
        idEmpresa={idEmpresa}
        editingUsuario={editingUsuario}
        onSubmit={handleUsuarioSubmit}
      />

      <Dialog open={!!clienteToDelete} onOpenChange={(o) => !o && setClienteToDelete(null)}>
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir cliente</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tem certeza que deseja excluir o cliente{" "}
              <span className="font-medium text-slate-900">{clienteToDelete?.contato_nome}</span>? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-2">
            <Button variant="outline" onClick={() => setClienteToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteCliente} disabled={isDeletingCliente}>
              {isDeletingCliente ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!usuarioToDelete} onOpenChange={(o) => !o && setUsuarioToDelete(null)}>
        <DialogContent className="sm:max-w-md gap-6">
          <DialogHeader className="space-y-3">
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Tem certeza que deseja excluir o usuário{" "}
              <span className="font-medium text-slate-900">{usuarioToDelete?.nome}</span>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-2">
            <Button variant="outline" onClick={() => setUsuarioToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteUsuario} disabled={isDeletingUsuario}>
              {isDeletingUsuario ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
