"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { addItem, getComandaState, setMaioridade } from "@/hooks/use-comanda";
import { toast } from "sonner";
import { ArrowLeft, Check, Scissors, ChevronRight } from "lucide-react";

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
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [maioridade, setMaioridadeLocal] = useState(false);

  useEffect(() => {
    const cliente = sessionStorage.getItem("totem-cliente");
    if (!cliente) {
      router.push("/totem");
      return;
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

  function handleContinue() {
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um serviço");
      return;
    }

    // Add selected services to comanda
    selected.forEach((id) => {
      const servico = servicos.find((s) => s.id === id);
      if (servico) {
        addItem({
          tipo: "servico",
          id: servico.id,
          nomeItem: servico.nome,
          precoUnit: Number(servico.preco),
          quantidade: 1,
          servicoId: servico.id,
        });
      }
    });

    setMaioridade(maioridade);
    router.push("/totem/bebidas");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body-md text-muted">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-hairline">
        <button
          onClick={() => router.push("/totem")}
          className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Trocar CPF
        </button>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
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
                    <p className="text-caption text-muted mt-1">{servico.duracaoMin} min</p>
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
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Maioridade */}
        <div className="flex items-center gap-3 mb-8 p-4 bg-surface-soft rounded-lg">
          <input
            type="checkbox"
            id="maioridade"
            checked={maioridade}
            onChange={(e) => setMaioridadeLocal(e.target.checked)}
            className="w-5 h-5 rounded border-hairline"
          />
          <label htmlFor="maioridade" className="text-body-md text-body cursor-pointer">
            Tenho mais de 18 anos e desejo ver o cardápio de bebidas alcoólicas
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
