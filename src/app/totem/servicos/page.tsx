"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TotemHeader } from "@/components/totem/totem-header";
import { FlowStepper, FLOW_STEPS } from "@/components/shared/flow-stepper";
import { addItem, getComandaState, setMaioridade, hydrateComandaFromStorage } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { toast } from "sonner";
import { Check, Scissors, ChevronRight } from "lucide-react";

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  preco: number;
  duracaoMin: number;
}

export default function ServicosPage() {
  const router = useRouter();
  const { getCliente, clearTotemSession, updateLastActivity } = useTotemSession();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [maioridade, setMaioridadeLocal] = useState(false);
  // Modo edição: id da comanda aberta e os ids de serviço que ela já tinha.
  const [editingComandaId, setEditingComandaId] = useState<string | null>(null);
  const [existingServiceIds, setExistingServiceIds] = useState<string[]>([]);

  useEffect(() => {
    hydrateComandaFromStorage();

    const cliente = getCliente();
    if (!cliente) {
      router.push("/totem");
      return;
    }

    // Se vier de "Adicionar Itens à Conta Existente", entra em modo edição:
    // pré-seleciona os serviços que a comanda aberta já possuía e guarda o id
    // da comanda para poder removê-los (desmarcar) ou adicionar novos.
    if (typeof window !== "undefined") {
      const rawServicos = sessionStorage.getItem("totem-resume-servicos");
      const rawComanda = sessionStorage.getItem("totem-resume-comanda");
      if (rawServicos || rawComanda) {
        // Remove apenas a chave de itens; mantém a chave da comanda para as
        // etapas seguintes (bebidas/produtos) continuarem em modo edição.
        sessionStorage.removeItem("totem-resume-servicos");
        let existingIds: string[] = [];
        try {
          existingIds = rawServicos ? JSON.parse(rawServicos) : [];
        } catch {
          /* ignora valor inválido */
        }
        setSelected(existingIds);
        setExistingServiceIds(existingIds);
        if (rawComanda) setEditingComandaId(rawComanda);
      }
    }

    fetch("/api/servicos")
      .then((res) => res.json())
      .then((data) => setServicos(data))
      .catch(() => toast.error("Erro ao carregar serviços"))
      .finally(() => setLoading(false));
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body-md text-muted-foreground">Carregando...</div>
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

      {/* pb-20 reserva espaço para a pill do carrinho fixa no rodapé */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <Scissors className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-2">Escolha seus serviços</h1>
          <p className="text-body-md text-body">
            Selecione os serviços que deseja realizar
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {servicos.map((servico) => {
            const isSelected = selected.includes(servico.id);
            return (
              <button
                key={servico.id}
                onClick={() => toggleServico(servico.id)}
                className={`w-full text-left p-5 rounded-lg border transition-all ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                    : "border-hairline bg-canvas hover:border-border-strong"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-title-sm text-ink">{servico.nome}</h3>
                    {servico.descricao && (
                      <p className="text-body-md text-body mt-0.5">{servico.descricao}</p>
                    )}
                    <p className="text-caption text-muted-foreground mt-1">{servico.duracaoMin} min</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-title-sm text-ink whitespace-nowrap">
                      R$ {Number(servico.preco).toFixed(2)}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-brand-primary border-brand-primary"
                          : "border-hairline"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-on-primary" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Maioridade */}
        <div className="mb-8 p-4 bg-surface-soft rounded-lg">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="maioridade"
              checked={maioridade}
              onChange={(e) => setMaioridadeLocal(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded border-hairline"
            />
            <div>
              <label htmlFor="maioridade" className="text-body-md text-body cursor-pointer block">
                Tenho mais de 18 anos e quero ver o cardápio de bebidas alcoólicas
              </label>
              <p className="text-caption text-muted-foreground mt-1">
                Bebidas alcólicas só aparecerão na próxima etapa se esta opção estiver marcada.
              </p>
            </div>
          </div>
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
