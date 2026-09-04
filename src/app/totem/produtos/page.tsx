"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TotemHeader } from "@/components/totem/totem-header";
import { FlowStepper, FLOW_STEPS } from "@/components/shared/flow-stepper";
import { CategoryChips } from "@/components/totem/category-chips";
import { MenuItemCard } from "@/components/totem/menu-item-card";
import { MenuSkeleton } from "@/components/totem/menu-skeleton";
import { addItem, hydrateComandaFromStorage } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { CART_PILL_SAFE_PADDING } from "@/lib/totem-utils";
import { toast } from "sonner";
import { Package, ChevronRight } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoriaId: string;
  categoria: { id: string; nome: string };
  imagem: string | null;
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
  // Modo edição: se veio de "Adicionar Itens à Conta Existente", o sessionStorage
  // traz as quantidades que a comanda aberta já tinha. Lido na montagem (a chave é
  // removida no efeito abaixo); como a tela mostra "Carregando..." até o fetch,
  // ler aqui não causa mismatch de hidratação.
  const [quantidades, setQuantidades] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(sessionStorage.getItem("totem-resume-produtos") || "{}");
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  // Id da comanda aberta (modo edição), lido do sessionStorage na montagem.
  const [editingComandaId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("totem-resume-comanda") : null
  );
  // Quantidades originais da comanda aberta (para saber o que desmarcar/reduzir).
  const [existingProdutos] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(sessionStorage.getItem("totem-resume-produtos") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    hydrateComandaFromStorage();

    const cliente = getCliente();
    if (!cliente) {
      router.push("/totem");
      return;
    }

    // Última etapa do fluxo: remove as chaves de itens e da comanda aberta
    // (ambas já lidas na montagem).
    sessionStorage.removeItem("totem-resume-produtos");
    sessionStorage.removeItem("totem-resume-comanda");

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
  }, [router, getCliente]);

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
      <div className="min-h-screen flex flex-col">
        <TotemHeader
          backLabel="Voltar às bebidas"
          showContinueLater
          onBack={() => router.push("/totem/bebidas")}
        />
        <div className={`flex-1 max-w-3xl mx-auto w-full px-4 py-8 ${CART_PILL_SAFE_PADDING}`}>
          <MenuSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TotemHeader
        backLabel="Voltar às bebidas"
        showContinueLater
        onBack={() => router.push("/totem/bebidas")}
      />

      {/* Stepper de progresso — separado do header */}
      <div className="px-4 pt-3">
        <FlowStepper steps={FLOW_STEPS} current={3} />
      </div>

      {/* CART_PILL_SAFE_PADDING reserva espaço para a pill do carrinho fixa no rodapé */}
      <div className={`flex-1 max-w-3xl mx-auto w-full px-4 py-8 ${CART_PILL_SAFE_PADDING}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <Package className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-2">Produtos</h1>
          <p className="text-body-md text-body">
            Produtos adicionais para levar
          </p>
        </div>

<CategoryChips categories={categorias} activeId={categoriaAtiva} onChange={setCategoriaAtiva} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {categoriasFiltradas.map((produto) => {
            const qtd = quantidades[produto.id] || 0;
            return (
              <MenuItemCard
                key={produto.id}
                name={produto.nome}
                price={Number(produto.preco)}
                description={produto.descricao}
                image={produto.imagem}
                variant="stepper"
                quantity={qtd}
                onAdd={() => addQuantidade(produto.id)}
                onRemove={() => removeQuantidade(produto.id)}
              />
            );
          })}
        </div>
        {categoriasFiltradas.length === 0 && (
          <div className="text-center py-8 text-body-md text-muted-foreground mb-8">
            Nenhum produto disponível
          </div>
        )}

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
