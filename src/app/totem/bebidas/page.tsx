"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { addItem, getComandaState } from "@/hooks/use-comanda";
import { toast } from "sonner";
import { ArrowLeft, Wine, Plus, Minus, ChevronRight } from "lucide-react";

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
  const [bebidas, setBebidas] = useState<Bebida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>("todas");
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const maioridade = getComandaState().maioridade;

  useEffect(() => {
    const cliente = sessionStorage.getItem("totem-cliente");
    if (!cliente) {
      router.push("/totem");
      return;
    }

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
  }, [router, maioridade]);

  function addQuantidade(id: string) {
    setQuantidades((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
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
  }

  function handleContinue() {
    // Add selected drinks to comanda
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
        <div className="text-body-md text-muted">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-hairline">
        <button
          onClick={() => router.push("/totem/servicos")}
          className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos serviços
        </button>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
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
                ? "bg-brand-primary text-white"
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
                  ? "bg-brand-primary text-white"
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
                  <p className="text-caption text-muted">
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
                      <span className="w-6 text-center text-body-md font-medium text-ink">
                        {qtd}
                      </span>
                      <button
                        onClick={() => addQuantidade(bebida.id)}
                        className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary-active"
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
            <div className="text-center py-8 text-body-md text-muted">
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
