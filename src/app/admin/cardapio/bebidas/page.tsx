"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Wine } from "lucide-react";

const bebidaSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  preco: z.string().min(1),
  categoriaId: z.string().min(1),
  possuiAlcool: z.boolean(),
  volumeMl: z.string().optional(),
});

type BebidaFormData = z.infer<typeof bebidaSchema>;

interface Categoria {
  id: string;
  nome: string;
}

interface Bebida {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoriaId: string;
  categoria: Categoria;
  possuiAlcool: boolean;
  volumeMl: number | null;
  ativo: boolean;
}

export default function BebidasPage() {
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<BebidaFormData>({
    resolver: zodResolver(bebidaSchema),
    defaultValues: { nome: "", descricao: "", preco: "", categoriaId: "", possuiAlcool: false, volumeMl: "" },
  });

  async function loadData() {
    try {
      const [bebidasRes, catRes] = await Promise.all([
        fetch("/api/cardapio/bebidas?todas=true"),
        fetch("/api/cardapio/categorias-bebida"),
      ]);
      setBebidas(await bebidasRes.json());
      setCategorias(await catRes.json());
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function onSubmit(data: BebidaFormData) {
    try {
      const url = editingId ? "/api/cardapio/bebidas" : "/api/cardapio/bebidas";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...data } : data),
      });

      if (!res.ok) throw new Error();
      toast.success(editingId ? "Bebida atualizada" : "Bebida criada");
      form.reset();
      setEditingId(null);
      setShowForm(false);
      loadData();
    } catch {
      toast.error("Erro ao salvar");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Desativar esta bebida?")) return;
    try {
      await fetch(`/api/cardapio/bebidas?id=${id}`, { method: "DELETE" });
      toast.success("Bebida desativada");
      loadData();
    } catch {
      toast.error("Erro ao desativar");
    }
  }

  function handleEdit(bebida: Bebida) {
    setEditingId(bebida.id);
    form.reset({
      nome: bebida.nome,
      descricao: bebida.descricao || "",
      preco: String(bebida.preco),
      categoriaId: bebida.categoriaId,
      possuiAlcool: bebida.possuiAlcool,
      volumeMl: bebida.volumeMl ? String(bebida.volumeMl) : "",
    });
    setShowForm(true);
  }

  if (loading) return <div className="text-body-md text-muted-foreground p-8">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Bebidas</h1>
          <p className="text-body-md text-body mt-1">Gerencie o cardápio de bebidas</p>
        </div>
        <ButtonPrimary onClick={() => { setShowForm(true); setEditingId(null); form.reset(); }}>
          <Plus className="w-4 h-4" /> Nova Bebida
        </ButtonPrimary>
      </div>

      {showForm && (
        <div className="bg-surface-soft border border-hairline rounded-lg p-6">
          <h2 className="text-title-md text-ink mb-4">{editingId ? "Editar" : "Nova"} Bebida</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <TextInput label="Nome" {...form.register("nome")} error={form.formState.errors.nome?.message} />
            </div>
            <div className="md:col-span-2">
              <TextInput label="Descrição" {...form.register("descricao")} />
            </div>
            <TextInput label="Preço (R$)" type="number" step="0.01" {...form.register("preco")} />
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-body">Categoria</label>
               <select {...form.register("categoriaId")} className="w-full h-11 px-4 py-3 bg-canvas text-ink text-body-md border border-border rounded-pill focus:outline-none focus:border-border focus:ring-2 focus:ring-primary">
                <option value="">Selecione...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <TextInput label="Volume (ml)" type="number" {...form.register("volumeMl")} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="possuiAlcool" {...form.register("possuiAlcool")} className="w-4 h-4 rounded border-hairline" />
              <label htmlFor="possuiAlcool" className="text-body-md text-body">Possui álcool</label>
            </div>
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
              <th className="text-left px-4 py-3 text-caption text-muted-foreground">Nome</th>
              <th className="text-left px-4 py-3 text-caption text-muted-foreground">Categoria</th>
              <th className="text-right px-4 py-3 text-caption text-muted-foreground">Preço</th>
              <th className="text-center px-4 py-3 text-caption text-muted-foreground">Álcool</th>
              <th className="text-center px-4 py-3 text-caption text-muted-foreground">Volume</th>
              <th className="text-center px-4 py-3 text-caption text-muted-foreground">Ativo</th>
              <th className="text-right px-4 py-3 text-caption text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bebidas.map((b) => (
              <tr key={b.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3 text-ink">{b.nome}</td>
                <td className="px-4 py-3 text-body">{b.categoria.nome}</td>
                <td className="px-4 py-3 text-right text-ink">R$ {Number(b.preco).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  {b.possuiAlcool ? <span className="text-xs text-signature-coral">Sim</span> : <span className="text-xs text-muted-foreground">Não</span>}
                </td>
                <td className="px-4 py-3 text-center text-body">{b.volumeMl ? `${b.volumeMl}ml` : "—"}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${b.ativo ? "bg-green-50 text-green-700" : "bg-secondary text-secondary-foreground"}`}>
                    {b.ativo ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(b)} className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-ink"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {bebidas.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-body"><Wine className="w-8 h-8 mx-auto mb-2 text-ink" />Nenhuma bebida encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
