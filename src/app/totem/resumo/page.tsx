"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";

import {
  getComandaState,
  getTotal,
  removeItem,
  updateQuantidade,
  limparComanda,
  hydrateComandaFromStorage,
  subscribeToComanda,
} from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Minus, Plus } from "lucide-react";

export default function ResumoPage() {
  const router = useRouter();
  const { getCliente, setComandaId } = useTotemSession();
  const [state, setState] = useState(getComandaState());
  const [loading, setLoading] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    hydrateComandaFromStorage();

    const cliente = getCliente();
    if (!cliente) {
      router.push("/totem");
      return;
    }

    const unsubscribe = subscribeToComanda(() => {
      setState(getComandaState());
      forceUpdate((n) => n + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const total = getTotal();

  async function handleAbrirComanda() {
    if (state.itens.length === 0) {
      toast.error("Adicione pelo menos um item à comanda");
      return;
    }

    setLoading(true);

    try {
      const clienteId = getCliente();
      let existingComandaId = null;

      if (clienteId && clienteId !== "guest") {
        const comandaRes = await fetch(`/api/comandas/totem/${clienteId}`);
        if (comandaRes.ok) {
          const data = await comandaRes.json();
          existingComandaId = data.id;
        }
      }

      if (existingComandaId) {
        const res = await fetch(`/api/comandas/${existingComandaId}/itens`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itens: state.itens.map((item) => ({
              nomeItem: item.nomeItem,
              precoUnit: item.precoUnit,
              quantidade: item.quantidade,
              servicoId: item.servicoId,
              bebidaId: item.bebidaId,
              produtoId: item.produtoId,
            })),
          }),
        });

        if (!res.ok) throw new Error();
        setComandaId(existingComandaId);
      } else {
        const res = await fetch("/api/comandas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clienteId: state.clienteId,
            quantidadeParcelas: state.quantidadeParcelas,
            itens: state.itens.map((item) => ({
              nomeItem: item.nomeItem,
              precoUnit: item.precoUnit,
              quantidade: item.quantidade,
              servicoId: item.servicoId,
              bebidaId: item.bebidaId,
              produtoId: item.produtoId,
            })),
          }),
        });

        if (!res.ok) throw new Error();
        const comanda = await res.json();
        setComandaId(comanda.id);
      }

      limparComanda();
      router.push("/totem/pagamento");
    } catch {
      toast.error("Erro ao processar comanda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (state.itens.length === 0 && state.clienteId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h2 className="text-display-md text-ink mb-4">Nenhum item selecionado</h2>
        <p className="text-body-md text-body mb-6">
          Volte e escolha seus serviços
        </p>
        <ButtonPrimary onClick={() => router.push("/totem/servicos")}>
          Escolher Serviços
        </ButtonPrimary>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-4 border-b border-hairline">
        <button
          onClick={() => router.push("/totem/produtos")}
          className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos produtos
        </button>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-display-md text-ink mb-1">Resumo da Comanda</h1>
          <p className="text-body-md text-body">
            {state.clienteNome} · {state.clienteCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
          </p>
        </div>

        {/* Itens */}
        <div className="mb-8">
          <p className="text-caption text-muted uppercase tracking-wide mb-3">
            Itens
          </p>
          <div className="space-y-2">
            {state.itens.map((item, index) => (
              <div
                key={`${item.tipo}-${item.id}`}
                className="flex items-center justify-between p-4 rounded-lg border border-hairline bg-canvas"
              >
                <div className="flex-1">
                  <p className="text-body-md text-ink">{item.nomeItem}</p>
                  <p className="text-caption text-muted">
                    R$ {item.precoUnit.toFixed(2)} cada
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        updateQuantidade(index, item.quantidade - 1);
                        forceUpdate((n) => n + 1);
                      }}
                      className="w-7 h-7 rounded-full border border-hairline flex items-center justify-center hover:bg-surface-soft"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-body-md font-medium text-ink">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => {
                        updateQuantidade(index, item.quantidade + 1);
                        forceUpdate((n) => n + 1);
                      }}
                      className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center hover:bg-brand-primary-active"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-body-md font-medium text-ink w-20 text-right">
                    R$ {(item.precoUnit * item.quantidade).toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      removeItem(index);
                      forceUpdate((n) => n + 1);
                    }}
                    className="p-1.5 text-body hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="mb-8 p-5 bg-surface-soft rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-title-md text-ink">Total</span>
            <span className="text-display-md text-ink font-medium">
              R$ {total.toFixed(2)}
            </span>
          </div>
          {state.quantidadeParcelas > 1 && (
            <div className="flex justify-end mt-1">
              <span className="text-caption text-muted">
                {state.quantidadeParcelas}x de R$ {(total / state.quantidadeParcelas).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
          <div className="flex gap-3">
            <ButtonSecondary
              onClick={() => router.push("/totem")}
              className="flex-1"
            >
              Início
            </ButtonSecondary>
            <ButtonSecondary
              onClick={() => router.push("/totem/produtos")}
              className="flex-1"
            >
              Cardápio
            </ButtonSecondary>
            <ButtonPrimary
              onClick={handleAbrirComanda}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Processando..." : "Confirmar"}
            </ButtonPrimary>
          </div>
      </div>
    </div>
  );
}
