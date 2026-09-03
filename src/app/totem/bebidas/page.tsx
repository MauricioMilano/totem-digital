"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TotemHeader } from "@/components/totem/totem-header";
import { FlowStepper, FLOW_STEPS } from "@/components/shared/flow-stepper";
import { addItem, getComandaState, hydrateComandaFromStorage } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { toast } from "sonner";
import { Plus, Minus, ChevronRight, Wine } from "lucide-react";

interface Bebida {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoriaId: string;
  categoria: { id: string; nome: string };
  possuiAlcool: boolean;
  volumeMl: number | null;
}

interface Categoria {
  id: string;
  nome: string;
}

export default function BebidasPage() {
  const router = useRouter();
  const { getCliente, updateLastActivity } = useTotemSession();
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas");
  // Modo edição: se veio de "Adicionar Itens à Conta Existente", o sessionStorage
  // traz as quantidades que a comanda aberta já tinha. Lido na montagem (a chave é
  // removida no efeito abaixo); como a tela mostra "Carregando..." até o fetch,
  // ler aqui não causa mismatch de hidratação.
  const [quantidades, setQuantidades] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(sessionStorage.getItem("totem-resume-bebidas") || "{}");
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const maioridade = getComandaState().maioridade;
  // Id da comanda aberta (modo edição), lido do sessionStorage na montagem.
  const [editingComandaId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("totem-resume-comanda") : null
  );
  // Quantidades originais da comanda aberta (para saber o que desmarcar/reduzir).
  const [existingBebidas] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(sessionStorage.getItem("totem-resume-bebidas") || "{}");
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

    // Remove a chave de itens (já lida na montagem); mantém a da comanda para a
    // etapa seguinte (produtos) continuar em modo edição.
    sessionStorage.removeItem("totem-resume-bebidas");

    async function load() {
      try {
        const [bebidasRes, catRes] = await Promise.all([
          fetch("/api/cardapio/bebidas"),
          fetch("/api/cardapio/categorias-bebida"),
        ]);
        const bebidasData = await bebidasRes.json();
        const catsData = await catRes.json();

        // Filter alcoholic drinks if not of age
        const filtered = maioridade
          ? bebidasData
          : bebidasData.filter((b: Bebida) => !b.possuiAlcool);

        setBebidas(filtered);
        setCategorias(catsData);
      } catch {
        toast.error("Erro ao carregar bebidas");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, maioridade, getCliente]);

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
    updateLastActivity();

    if (editingComandaId) {
      // Modo edição da comanda aberta: o que já estava na comanda não volta ao
      // carrinho — apenas ajustamos as diferenças. Desmarcar/reduzir remove via
      // DELETE; aumentar/adicionar vai para o carrinho (mesclado no resumo).
      setLoading(true);
      try {
        // Itens existentes que foram reduzidos ou totalmente desmarcados.
        for (const [id, existingQty] of Object.entries(existingBebidas)) {
          const currentQty = quantidades[id] || 0;
          if (currentQty < existingQty) {
            await fetch(
              `/api/comandas/${editingComandaId}/itens?bebidaId=${encodeURIComponent(id)}&quantidade=${existingQty - currentQty}`,
              { method: "DELETE" }
            );
          }
        }

        // Itens novos, ou aumentados acima da quantidade existente.
        for (const [id, qtd] of Object.entries(quantidades)) {
          const existingQty = existingBebidas[id] || 0;
          if (qtd > existingQty) {
            const bebida = bebidas.find((b) => b.id === id);
            if (!bebida) continue;
            addItem({
              tipo: "bebida",
              id: bebida.id,
              nomeItem: bebida.nome,
              precoUnit: Number(bebida.preco),
              quantidade: qtd - existingQty,
              bebidaId: bebida.id,
            });
          }
        }

        router.push("/totem/produtos");
      } catch {
        toast.error("Erro ao atualizar bebidas. Tente novamente.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Fluxo normal (sem comanda aberta): adiciona tudo ao carrinho.
    Object.entries(quantidades).forEach(([id, qtd]) => {
      const bebida = bebidas.find((b) => b.id === id);
      if (bebida && qtd > 0) {
        addItem({
          tipo: "bebida",
          id: bebida.id,
          nomeItem: bebida.nome,
          precoUnit: Number(bebida.preco),
          quantidade: qtd,
          bebidaId: bebida.id,
        });
      }
    });

    router.push("/totem/produtos");
  }

  const categoriasFiltradas = categoriaAtiva === "todas"
    ? bebidas
    : bebidas.filter((b) => b.categoriaId === categoriaAtiva);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body-md text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TotemHeader
        backLabel="Voltar aos serviços"
        showContinueLater
        onBack={() => router.push("/totem/servicos")}
      />

      {/* Stepper de progresso — separado do header */}
      <div className="px-4 pt-3">
        <FlowStepper steps={FLOW_STEPS} current={2} />
      </div>

      {/* pb-20 reserva espaço para a pill do carrinho fixa no rodapé */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <Wine className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-2">Bebidas</h1>
          <p className="text-body-md text-body">
            Escolha suas bebidas {!maioridade && "(após verificar maioridade)"}
          </p>
        </div>

        {/* Category filter */}
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
          {categoriasFiltradas.map((bebida) => {
            const qtd = quantidades[bebida.id] || 0;
            return (
              <div
                key={bebida.id}
                className="flex items-center justify-between p-4 rounded-lg border border-hairline bg-canvas hover:border-border-strong transition-colors"
              >
                <div className="flex-1">
                  <h3 className="text-body-md font-medium text-ink">{bebida.nome}</h3>
                  <p className="text-caption text-muted-foreground">
                    {bebida.volumeMl ? `${bebida.volumeMl}ml` : ""}
                    {bebida.possuiAlcool && " · Alcoólica"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-body-md font-medium text-ink">
                    R$ {Number(bebida.preco).toFixed(2)}
                  </span>
                  {qtd > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeQuantidade(bebida.id)}
                        className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center hover:bg-surface-soft"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-body-md font-medium text-ink w-6 text-center">
                        {qtd}
                      </span>
                      <button
                        onClick={() => addQuantidade(bebida.id)}
                        className="w-8 h-8 rounded-full bg-brand-primary text-on-primary flex items-center justify-center hover:bg-brand-primary-active"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addQuantidade(bebida.id)}
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
              Nenhuma bebida disponível
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <ButtonSecondary
            onClick={() => router.push("/totem/servicos")}
            className="flex-1"
          >
            Voltar
          </ButtonSecondary>
          <ButtonPrimary onClick={handleContinue} className="flex-1">
            Continuar
            <ChevronRight className="w-4 h-4" />
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
