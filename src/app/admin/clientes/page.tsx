"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TextInput } from "@/components/shared/text-input";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { Search, Users } from "lucide-react";
import { useForm } from "react-hook-form";

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  createdAt: string;
  _count?: { comandas: number };
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit } = useForm<{ search: string }>();
  const [search, setSearch] = useState("");

  async function loadClientes(searchTerm?: string) {
    try {
      const url = searchTerm
        ? `/api/clientes?search=${encodeURIComponent(searchTerm)}`
        : "/api/clientes";
      const res = await fetch(url);
      const data = await res.json();
      setClientes(data);
    } catch {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { (async () => { await loadClientes(); })(); }, []);

  function onSearch(data: { search: string }) {
    setSearch(data.search);
    loadClientes(data.search);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-md text-ink">Clientes</h1>
        <p className="text-body-md text-body mt-1">Consulte os clientes cadastrados</p>
      </div>

      <form onSubmit={handleSubmit(onSearch)} className="flex gap-3 max-w-md">
        <TextInput
          placeholder="Buscar por nome ou CPF..."
          {...register("search")}
        />
        <ButtonPrimary type="submit">
          <Search className="w-4 h-4" />
        </ButtonPrimary>
        {search && (
          <ButtonSecondary type="button" onClick={() => { setSearch(""); loadClientes(); }}>
            Limpar
          </ButtonSecondary>
        )}
      </form>

      {loading ? (
        <div className="text-body-md text-muted-foreground">Carregando...</div>
      ) : (
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <table className="w-full text-body-md">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">CPF</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Telefone</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Email</th>
                <th className="text-center px-4 py-3 text-caption text-muted-foreground">Comandas</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 text-ink font-medium">{cliente.nome}</td>
                  <td className="px-4 py-3 text-body font-mono">{cliente.cpf}</td>
                  <td className="px-4 py-3 text-body">{cliente.telefone || "—"}</td>
                  <td className="px-4 py-3 text-body">{cliente.email || "—"}</td>
                  <td className="px-4 py-3 text-center text-body">
                    {(cliente as any)._count?.comandas || 0}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {new Date(cliente.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-body">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
