"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Scissors } from "lucide-react";

const servicoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  preco: z.string().min(1, "Preço é obrigatório"),
  duracaoMin: z.string().optional(),
});

type ServicoFormData = z.infer<typeof servicoSchema>;

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  categoriaId: string;
  categoria: { id: string; nome: string };
  preco: number;
  duracaoMin: number;
  imagem: string | null;
  ativo: boolean;
}

interface Categoria {
  id: string;
  nome: string;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);

  const form = useForm<ServicoFormData>({
    resolver: zodResolver(servicoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      categoriaId: "",
      preco: "",
      duracaoMin: "30",
    },
  });

  async function loadServicos() {
    try {
      const [servicosRes, catRes] = await Promise.all([
        fetch("/api/servicos?todas=true"),
        fetch("/api/cardapio/categorias-servico"),
      ]);
      setServicos(await servicosRes.json());
      const cats = await catRes.json();
      setCategorias(cats);
      if (!form.getValues().categoriaId && cats.length > 0) {
        form.setValue("categoriaId", cats[0].id);
      }
    } catch {
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { (async () => { await loadServicos(); })(); }, []);

  async function onSubmit(data: ServicoFormData) {
    try {
      const url = editingId
        ? `/api/servicos/${editingId}`
        : "/api/servicos";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, imagem }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      toast.success(editingId ? "Serviço atualizado" : "Serviço criado");
      form.reset();
      setImagem(null);
      setEditingId(null);
      setShowForm(false);
      loadServicos();
    } catch {
      toast.error("Erro ao salvar serviço");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Desativar este serviço?")) return;
    try {
      await fetch(`/api/servicos/${id}`, { method: "DELETE" });
      toast.success("Serviço desativado");
      loadServicos();
    } catch {
      toast.error("Erro ao desativar");
    }
  }

  function handleEdit(servico: Servico) {
    setEditingId(servico.id);
    form.reset({
      nome: servico.nome,
      descricao: servico.descricao || "",
      categoriaId: servico.categoriaId,
      preco: String(servico.preco),
      duracaoMin: String(servico.duracaoMin),
    });
    setImagem(servico.imagem || null);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-body-md text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Serviços</h1>
          <p className="text-body-md text-body mt-1">Gerencie os serviços oferecidos</p>
        </div>
        <ButtonPrimary onClick={() => { setShowForm(true); setEditingId(null); setImagem(null); form.reset({ nome: "", descricao: "", categoriaId: categorias[0]?.id || "", preco: "", duracaoMin: "30" }); }}>
          <Plus className="w-4 h-4" />
          Novo Serviço
        </ButtonPrimary>
      </div>

      {showForm && (
        <div className="bg-surface-soft border border-hairline rounded-lg p-6">
          <h2 className="text-title-md text-ink mb-4">
            {editingId ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <TextInput label="Nome" {...form.register("nome")} error={form.formState.errors.nome?.message} />
            </div>
            <div className="md:col-span-2">
              <TextInput label="Descrição" {...form.register("descricao")} />
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-caption text-body">Imagem</label>
              <ImageUpload value={imagem} onChange={setImagem} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-caption text-body">Categoria</label>
              <select
                {...form.register("categoriaId")}
                 className="w-full h-11 px-4 py-3 bg-canvas text-ink text-body-md border border-border rounded-pill focus:outline-none focus:border-border focus:ring-2 focus:ring-primary"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <TextInput label="Preço (R$)" type="number" step="0.01" {...form.register("preco")} error={form.formState.errors.preco?.message} />
            <TextInput label="Duração (min)" type="number" {...form.register("duracaoMin")} />
            <div className="md:col-span-2 flex gap-3">
              <ButtonPrimary type="submit">{editingId ? "Salvar" : "Criar"}</ButtonPrimary>
              <ButtonSecondary type="button" onClick={() => { setShowForm(false); setEditingId(null); setImagem(null); form.reset(); }}>
                Cancelar
              </ButtonSecondary>
            </div>
          </form>
        </div>
      )}

      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
        <table className="w-full text-body-md">
          <thead>
            <tr className="border-b border-hairline bg-surface-soft">
              <th className="text-left px-4 py-3 text-caption text-muted-foreground">Foto</th>
              <th className="text-left px-4 py-3 text-caption text-muted-foreground">Nome</th>
              <th className="text-left px-4 py-3 text-caption text-muted-foreground">Categoria</th>
              <th className="text-right px-4 py-3 text-caption text-muted-foreground">Preço</th>
              <th className="text-center px-4 py-3 text-caption text-muted-foreground">Duração</th>
              <th className="text-center px-4 py-3 text-caption text-muted-foreground">Ativo</th>
              <th className="text-right px-4 py-3 text-caption text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((servico) => (
              <tr key={servico.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3">
                  {servico.imagem ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={servico.imagem} alt={servico.nome} className="h-10 w-14 rounded object-cover border border-hairline" />
                  ) : (
                    <div className="h-10 w-14 rounded bg-surface-soft flex items-center justify-center text-caption text-muted-foreground">—</div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink">{servico.nome}</td>
                <td className="px-4 py-3 text-body">{servico.categoria?.nome || "—"}</td>
                <td className="px-4 py-3 text-right text-ink">R$ {Number(servico.preco).toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-body">{servico.duracaoMin} min</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${servico.ativo ? "bg-green-50 text-green-700" : "bg-secondary text-secondary-foreground"}`}>
                    {servico.ativo ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(servico)} className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-ink">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(servico.id)} className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {servicos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-body">
                  <Scissors className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  Nenhum serviço encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
