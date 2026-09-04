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
import { addItem, getComandaState, setMaioridade, hydrateComandaFromStorage } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { CART_PILL_SAFE_PADDING } from "@/lib/totem-utils";
import { toast } from "sonner";
import { Scissors, ChevronRight, Clock, BadgeCheck } from "lucide-react";

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  categoriaId: string;
  categoria: { id: string; nome: string };
  preco: number;
  duracaoMin: number;
  imagem: string | null;
}

interface Categoria {
  id: string;
  nome: string;
}

export default function ServicosPage() {
  const router = useRouter();
  const { getCliente, clearTotemSession, updateLastActivity } = useTotemSession();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas");
  const [loading, setLoading] = useState(true);
  // Modo edição: se veio de "Adicionar Itens à Conta Existente", o sessionStorage
  // traz os ids dos serviços que a comanda aberta já tinha. Lido na montagem (a
  // chave é removida no efeito abaixo); como a tela mostra "Carregando..." até o
  // fetch, ler aqui não causa mismatch de hidratação.
  const [selected, setSelected] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem("totem-resume-servicos") || "[]");
    } catch {
      return [];
    }
  });
  const [maioridade, setMaioridadeLocal] = useState(false);
  // Id da comanda aberta (modo edição), lido do sessionStorage na montagem.
  const [editingComandaId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("totem-resume-comanda") : null
  );
  // Ids originais dos serviços da comanda aberta (para saber o que desmarcar).
  const [existingServiceIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(sessionStorage.getItem("totem-resume-servicos") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    hydrateComandaFromStorage();

    const cliente = getCliente();
    if (!cliente) {
      router.push("/totem");
      return;
    }

    // Remove a chave de itens (já lida na montagem); mantém a da comanda para as
    // etapas seguintes (bebidas/produtos) continuarem em modo edição.
    sessionStorage.removeItem("totem-resume-servicos");

    async function load() {
      try {
        const [servicosRes, catRes] = await Promise.all([
          fetch("/api/servicos"),
          fetch("/api/cardapio/categorias-servico"),
        ]);
        setServicos(await servicosRes.json());
        setCategorias(await catRes.json());
      } catch {
        toast.error("Erro ao carregar serviços");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, getCliente]);

  function toggleServico(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleContinue() {
    updateLastActivity();
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um serviço");
      return;
    }

    setLoading(true);
    try {
      if (editingComandaId) {
        // Modo edição da comanda aberta: desmarcar remove, marcar adiciona.
        const removedIds = existingServiceIds.filter((id) => !selected.includes(id));
        for (const id of removedIds) {
          await fetch(
            `/api/comandas/${editingComandaId}/itens?servicoId=${encodeURIComponent(id)}&quantidade=1`,
            { method: "DELETE" }
          );
        }

        const newIds = selected.filter((id) => !existingServiceIds.includes(id));
        for (const id of newIds) {
          const servico = servicos.find((s) => s.id === id);
          if (!servico) continue;
          addItem({
            tipo: "servico",
            id: servico.id,
            nomeItem: servico.nome,
            precoUnit: Number(servico.preco),
            quantidade: 1,
            servicoId: servico.id,
          });
        }

        setMaioridade(maioridade);
        router.push("/totem/bebidas");
        return;
      }

      // Fluxo normal (sem comanda aberta): adiciona todos os selecionados ao carrinho.
      selected.forEach((id) => {
        const servico = servicos.find((s) => s.id === id);
        if (!servico) return;
        addItem({
          tipo: "servico",
          id: servico.id,
          nomeItem: servico.nome,
          precoUnit: Number(servico.preco),
          quantidade: 1,
          servicoId: servico.id,
        });
      });
      setMaioridade(maioridade);
      router.push("/totem/bebidas");
    } catch (error) {
      toast.error("Erro ao adicionar serviços. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const servicosFiltrados = categoriaAtiva === "todas"
    ? servicos
    : servicos.filter((s) => s.categoriaId === categoriaAtiva);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TotemHeader
          backLabel="Trocar cliente"
          showContinueLater
          onBack={() => {
            clearTotemSession();
            router.push("/totem");
          }}
        />
        <div className={`flex-1 max-w-3xl mx-auto w-full px-4 py-8 ${CART_PILL_SAFE_PADDING}`}>
          <MenuSkeleton rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header padronizado (stepper fica fora, logo abaixo) */}
      <TotemHeader
        backLabel="Trocar cliente"
        showContinueLater
        onBack={() => {
          clearTotemSession();
          router.push("/totem");
        }}
      />

      {/* Stepper de progresso — separado do header */}
      <div className="px-4 pt-3">
        <FlowStepper steps={FLOW_STEPS} current={1} />
      </div>

      {/* CART_PILL_SAFE_PADDING reserva espaço para a pill do carrinho fixa no rodapé */}
      <div className={`flex-1 max-w-3xl mx-auto w-full px-4 py-8 ${CART_PILL_SAFE_PADDING}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <Scissors className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-2">Escolha seus serviços</h1>
          <p className="text-body-md text-body">
            Selecione os serviços que deseja realizar
          </p>
        </div>

<CategoryChips categories={categorias} activeId={categoriaAtiva} onChange={setCategoriaAtiva} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {servicosFiltrados.map((servico) => {
            const isSelected = selected.includes(servico.id);
            return (
              <MenuItemCard
                key={servico.id}
                name={servico.nome}
                price={Number(servico.preco)}
                description={servico.descricao}
                image={servico.imagem}
                meta={[{ icon: Clock, label: `${servico.duracaoMin} min` }]}
                variant="select"
                selected={isSelected}
                onSelect={() => toggleServico(servico.id)}
              />
            );
          })}
        </div>
        {servicosFiltrados.length === 0 && (
          <div className="text-center py-8 text-body-md text-muted-foreground mb-8">
            Nenhum serviço disponível
          </div>
        )}

        {/* Maioridade — card destacado */}
        <div className="mb-8 p-5 rounded-xl border border-brand-primary/40 bg-gradient-to-br from-surface-card to-surface-soft">
          <label htmlFor="maioridade" className="flex items-start gap-3 cursor-pointer group min-h-[44px]">
            <input
              type="checkbox"
              id="maioridade"
              checked={maioridade}
              onChange={(e) => setMaioridadeLocal(e.target.checked)}
              className="w-6 h-6 mt-0.5 rounded border-border-strong accent-[#DCC39E]"
            />
            <div>
              <span className="flex items-center gap-2 text-title-sm text-ink">
                <BadgeCheck className="w-4 h-4 text-brand-primary" />
                Tenho 18 anos ou mais
              </span>
              <p className="text-body-md text-body mt-1">
                Marque para liberar o cardápio de bebidas alcoólicas na próxima etapa.
              </p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <ButtonSecondary
            onClick={() => router.push("/totem")}
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
