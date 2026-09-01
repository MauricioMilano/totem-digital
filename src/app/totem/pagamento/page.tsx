"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { PagamentoSelector } from "@/components/totem/pagamento-selector";
import { FlowStepper } from "@/components/shared/flow-stepper";
import { toast } from "sonner";
import { CreditCard, ArrowLeft } from "lucide-react";
import { useTotemSession } from "@/hooks/use-totem-session";

interface Comanda {
  id: string;
  total: number;
  cliente: { nome: string } | null;
}

export default function PagamentoPage() {
  const router = useRouter();
  const { getCliente } = useTotemSession();
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [formaPagamentoId, setFormaPagamentoId] = useState<string | null>(null);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1);

  useEffect(() => {
    async function fetchComanda() {
      const clienteId = getCliente();
      if (!clienteId) {
        toast.error("Você precisa estar identificado para pagar sua comanda");
        router.push("/totem");
        return;
      }

      try {
        const res = await fetch(`/api/comandas/totem/${clienteId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setComanda(data);
      } catch {
        toast.error("Nenhuma comanda aberta encontrada");
        router.push("/totem");
      } finally {
        setLoading(false);
      }
    }

    fetchComanda();
  }, [router]);

  async function handleConfirmPayment() {
    if (!comanda) return;

    if (!formaPagamentoId) {
      toast.error("Por favor, selecione uma forma de pagamento.");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch(`/api/comandas/${comanda.id}/pagar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formaPagamentoId,
          quantidadeParcelas,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Pagamento processado com sucesso!");
      router.push("/totem/sucesso");
    } catch {
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body-md text-muted">Carregando...</div>
      </div>
    );
  }

  if (!comanda) return null;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-surface-soft">
      {/* Top bar: voltar + etapas */}
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => router.push("/totem/resumo")}
          className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao pedido
        </button>
        <FlowStepper steps={["Serviços", "Bebidas", "Produtos", "Resumo", "Pagamento"]} current={5} />
      </div>

      <div className="w-full max-w-md bg-canvas border border-hairline rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 bg-brand-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6" />
            <h1 className="text-title-md font-medium">Pagamento</h1>
          </div>
          <span className="text-body-sm opacity-90">
            {comanda.cliente?.nome || "Cliente"}
          </span>
        </div>

        <div className="p-8 text-center space-y-6">
          <div>
            <p className="text-body-md text-muted mb-2">Valor Total a Pagar</p>
            <p className="text-display-lg text-ink font-black">
              R$ {Number(comanda.total).toFixed(2)}
            </p>
          </div>

          <div className="bg-surface-soft p-4 rounded-xl text-caption text-body text-center">
            Ao confirmar, sua comanda será marcada como paga e finalizada.
          </div >

          <PagamentoSelector
            total={Number(comanda.total)}
            onSelectForma={setFormaPagamentoId}
            onSelectParcelas={setQuantidadeParcelas}
            formaPagamentoId={formaPagamentoId}
            quantidadeParcelas={quantidadeParcelas}
          />

          <div className="flex flex-col gap-3">
            <ButtonPrimary 
              onClick={handleConfirmPayment} 
              disabled={paying || !formaPagamentoId}
              className="w-full py-6 text-lg"
            >
              {paying ? "Processando..." : "Confirmar Pagamento"}
            </ButtonPrimary>
            <ButtonSecondary 
              onClick={() => router.push("/totem/resumo")} 
              className="w-full py-4"
            >
              Voltar ao pedido
            </ButtonSecondary>
          </div>
        </div>
      </div>
    </div>
  );
}
