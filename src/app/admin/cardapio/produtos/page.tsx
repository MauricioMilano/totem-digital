"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

const productSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  preco: z.string().min(1),
  categoriaId: z.string().min(1),
  quantidade: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Categoria {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoriaId: string;
  categoria: Categoria;
  quantidade: number;
  ativo: boolean;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { nome: "", descricao: "", preco: "", categoriaId: "", quantidade: "0" },
  });

  async function loadData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/cardapio/produtos?todas=true"),
        fetch("/api/cardapio/categorias-produto"),
      ]);
      setProdutos(await prodRes.json());
      setCategorias(await catRes.json());
    } catch {
      toast.error("Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function onSubmit(data: ProductFormData) {
    try {
      const res = await fetch(editingId ? `/api/cardapio/produtos/${editingId}` : "/api/cardapio/produtos", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Produto atualizado" : "Produto criado");
      form.reset();
      setEditingId(null);
      setShowForm(false);
      loadData();
    } catch {
      toast.error("Erro ao salvar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Desativar este produto?")) return;
    try {
      await fetch(`/api/cardapio/produtos/${id}`, { method: "DELETE" });
      toast.success("Produto desativado");
      loadData();
    } catch {
      toast.error("Erro ao desativar");
    }
  }

  function handleEdit(p: Produto) {
    setEditingId(p.id);
    form.reset({ nome: p.nome, descricao: p.descricao || "", preco: String(p.preco), categoriaId: p.categoriaId, quantidade: String(p.quantidade) });
    setShowForm(true);
  }

  if (loading) return <div className="text-body-md text-muted p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Produtos</h1>
          <p className="text-body-md text-body mt-1">Gerencie os produtos para venda</p>
        </div>
        <ButtonPrimary onClick={() => { setShowForm(true); setEditingId(null); form.reset(); }}>
          <Plus className="w-4 h-4" /> Novo Produto
        </ButtonPrimary>
      </div>

      {showForm && (
        <div className="bg-surface-soft border border-hairline rounded-lg p-6">
          <h2 className="text-title-md text-ink mb-4">{editingId ? "Editar" : "Novo"} Produto</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><TextInput label="Nome" {...form.register("nome")} /></div>
            <div className="md:col-span-2"><TextInput label="Descrição" {...form.register("descricao")} /></div>
            <TextInput label="Preço (R$)" type="number" step="0.01" {...form.register("preco")} />
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-body">Categoria</label>
              <select {...form.register("categoriaId")} className="w-full h-11 px-4 py-3 bg-canvas text-ink text-body-md border border-border rounded-pill focus:outline-none focus:border-border focus:ring-2 focus:ring-primary">
                <option value="">Selecione...</option>
                {categorias.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
              </select>
            </div>
            <TextInput label="Quantidade em estoque" type="number" {...form.register("quantidade")} />
            <div className="md:col-span-2 flex gap-3">
              <ButtonPrimary type="submit">{editingId ? "Salvar" : "Criar"}</ButtonPrimary>
              <ButtonSecondary type="button" onClick={() => { setShowForm(false); setEditingId(null); form.reset(); }}>Cancelar</ButtonSecondary>
            </div>
          </form>
        </div>
      )}

      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <table className="w-full text-body-md">
          <thead>
            <tr className="border-b border-hairline bg-surface-soft">
              <th className="text-left px-4 py-3 text-caption text-muted">Nome</th>
              <th className="text-left px-4 py-3 text-caption text-muted">Categoria</th>
              <th className="text-right px-4 py-3 text-caption text-muted">Preço</th>
              <th className="text-center px-4 py-3 text-caption text-muted">Estoque</th>
              <th className="text-center px-4 py-3 text-caption text-muted">Ativo</th>
              <th className="text-right px-4 py-3 text-caption text-muted">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3 text-ink">{p.nome}</td>
                <td className="px-4 py-3 text-body">{p.categoria.nome}</td>
                <td className="px-4 py-3 text-right text-ink">R$ {Number(p.preco).toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-body">{p.quantidade}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${p.ativo ? "bg-green-50 text-green-700" : "bg-secondary text-muted"}`}>
                    {p.ativo ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-ink"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-body"><Package className="w-8 h-8 mx-auto mb-2 text-muted" />Nenhum produto encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
