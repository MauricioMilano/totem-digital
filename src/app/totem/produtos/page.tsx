"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { Skeleton } from "@/components/ui/skeleton";
import { TotemFlowHeader } from "@/components/totem/totem-flow-header";
import { addItem, hydrateComandaFromStorage } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { toast } from "sonner";
import { Package, Plus, Minus, ChevronRight } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoriaId: string;
  categoria: { id: string; nome: string };
}

interface Categoria {
  id: string;
  nome: string;
}

export default function ProdutosPage() {
  const router = useRouter();
  const { getCliente, updateLastActivity } = useTotemSession();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>(
[]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas");
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  // Modo edição: id da comanda aberta e as quantidades de produto que ela já tinha.
  const [editingComandaId, setEditingComandaId] = useState<string | null>(null);
  const [existingProdutos, setExistingProdutos] = useState<Record<string, number>>({});

  useEffect(() => {
    hydrateComandaFromStorage();

    const cliente = getCliente();
    if (!cliente) {
      router.push("/totem");
      return;
    }

    // Se vier de "Adicionar Itens à Conta Existente", entra em modo edição:
    // pré-preenche as quantidades que a comanda aberta já tinha e guarda o id
    // da comanda para poder removê-las (desmarcar) ou adicionar novos.
    if (typeof window !== "undefined") {
      const rawProdutos = sessionStorage.getItem("totem-resume-produtos");
      const rawComanda = sessionStorage.getItem("totem-resume-comanda");
      if (rawProdutos || rawComanda) {
        // Última etapa do fluxo: remove também a chave da comanda aberta.
        sessionStorage.removeItem("totem-resume-produtos");
        sessionStorage.removeItem("totem-resume-comanda");
        let existing: Record<string, number> = {};
        try {
          existing = rawProdutos ? JSON.parse(rawProdutos) : {};
        } catch {
          /* ignora valor inválido */
        }
        setQuantidades(existing);
        setExistingProdutos(existing);
        if (rawComanda) setEditingComandaId(rawComanda);
      }
    }

    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/cardapio/produtos"),
          fetch("/api/cardapio/categorias-produto"),
        ]);
        setProdutos(await prodRes.json());
        setCategorias(await catRes.json());
      } catch {
        toast.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  function addQuantidade(id: string) {
    setQuantidades((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    updateLastActivity();
  }

  function removeQuantidade(id: string) {
    setQuantidades((prev) => {
      const atual = prev[id] || 0;
      if (atual <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: atual - 1 };
    });
    updateLastActivity();
  }

  async function handleContinue() {
    if (editingComandaId) {
      // Modo edição da comanda aberta: o que já estava na comanda não volta ao
      // carrinho — apenas ajustamos as diferenças. Desmarcar/reduzir remove via
      // DELETE; aumentar/adicionar vai para o carrinho (mesclado no resumo).
      setLoading(true);
      try {
        // Itens existentes que foram reduzidos ou totalmente desmarcados.
        for (const [id, existingQty] of Object.entries(existingProdutos)) {
          const currentQty = quantidades[id] || 0;
          if (currentQty < existingQty) {
            await fetch(
              `/api/comandas/${editingComandaId}/itens?produtoId=${encodeURIComponent(id)}&quantidade=${existingQty - currentQty}`,
              { method: "DELETE" }
            );
          }
        }

        // Itens novos, ou aumentados acima da quantidade existente.
        for (const [id, qtd] of Object.entries(quantidades)) {
          const existingQty = existingProdutos[id] || 0;
          if (qtd > existingQty) {
            const produto = produtos.find((p) => p.id === id);
            if (!produto) continue;
            addItem({
              tipo: "produto",
              id: produto.id,
              nomeItem: produto.nome,
              precoUnit: Number(produto.preco),
              quantidade: qtd - existingQty,
              produtoId: produto.id,
            });
          }
        }

        router.push("/totem/resumo");
      } catch {
        toast.error("Erro ao atualizar produtos. Tente novamente.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fluxo normal (sem comanda aberta): adiciona tudo ao carrinho.
    Object.entries(quantidades).forEach(([id, qtd]) => {
      const produto = produtos.find((p) => p.id === id);
      if (produto && qtd > 0) {
        addItem({
          tipo: "produto",
          id: produto.id,
          nomeItem: produto.nome,
          precoUnit: Number(produto.preco),
          quantidade: qtd,
          produtoId: produto.id,
        });
      }
    });

    router.push("/totem/resumo");
  }

  const categoriasFiltradas = categoriaAtiva === "todas"
    ? produtos
    : produtos.filter((p) => p.categoriaId === categoriaAtiva);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-hairline bg-canvas">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TotemFlowHeader
        current={3}
        backLabel="Voltar às bebidas"
        onBack={() => router.push("/totem/bebidas")}
      />

      {/* pb-20 reserva espaço para a pill do carrinho fixa no rodapé */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <Package className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-2">Produtos</h1>
          <p className="text-body-md text-body">
            Produtos adicionais para levar
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setCategoriaAtiva("todas")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-body-md transition-colors ${
              categoriaAtiva === "todas"
                ? "bg-brand-primary text-on-primary"
                : "bg-surface-soft text-body hover:text-ink"
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap text-body-md transition-colors ${
                categoriaAtiva === cat.id
                  ? "bg-brand-primary text-on-primary"
                  : "bg-surface-soft text-body hover:text-ink"
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        <div className="space-y-2 mb-8">
          {categoriasFiltradas.map((produto) => {
            const qtd = quantidades[produto.id] || 0;
            return (
              <div
                key={produto.id}
                className="flex items-center justify-between p-4 rounded-lg border border-hairline bg-canvas hover:border-border-strong transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-body-md font-medium text-ink">{produto.nome}</h3>
                  {produto.descricao && (
                    <p className="text-caption text-muted-foreground">{produto.descricao}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-body-md font-medium text-ink">
                    R$ {Number(produto.preco).toFixed(2)}
                  </span>
                  {qtd > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeQuantidade(produto.id)}
                        className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center hover:bg-surface-soft"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-body-md font-medium text-ink">{qtd}</span>
                      <button
                        onClick={() => addQuantidade(produto.id)}
                        className="w-8 h-8 rounded-full bg-brand-primary text-on-primary flex items-center justify-center hover:bg-brand-primary-active"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addQuantidade(produto.id)}
                      className="w-9 h-9 rounded-lg border border-hairline flex items-center justify-center hover:bg-surface-soft"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {categoriasFiltradas.length === 0 && (
            <div className="text-center py-8 text-body-md text-muted-foreground">
              Nenhum produto disponível
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <ButtonSecondary
            onClick={() => router.push("/totem/bebidas")}
            className="flex-1"
          >
            Voltar
          </ButtonSecondary>
          <ButtonPrimary onClick={handleContinue} className="flex-1">
            Revisar Pedido
            <ChevronRight className="w-4 h-4" />
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
