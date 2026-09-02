"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { PagamentoSelector } from "@/components/totem/pagamento-selector";
import { TotemHeader } from "@/components/totem/totem-header";
import { FlowStepper, FLOW_STEPS } from "@/components/shared/flow-stepper";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import { useTotemSession, getCliente, getComandaId } from "@/hooks/use-totem-session";

async function resolveComanda() {
  const comandaId = getComandaId();
  if (comandaId) {
    const res = await fetch(`/api/comandas/${comandaId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "ABERTA") return data;
    }
  }
  const clienteId = getCliente();
  if (clienteId && clienteId !== "guest") {
    const res = await fetch(`/api/comandas/totem/${clienteId}`);
    if (res.ok) return res.json();
  }
  return null;
}

interface Comanda {
  id: string;
  total: number;
  cliente: { nome: string } | null;
}

export default function PagamentoPage() {
  const router = useRouter();
  const { getCliente, getComandaId } = useTotemSession();
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [formaPagamentoId, setFormaPagamentoId] = useState<string | null>(null);
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1);

  useEffect(() => {
    async function fetchComanda() {
      try {
        const data = await resolveComanda();
        if (!data) {
          toast.error("Nenhuma comanda aberta encontrada");
          router.push("/totem/minha-conta");
          return;
        }
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
        <div className="text-body-md text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!comanda) return null;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-surface-soft">
      {/* Header padronizado (stepper separado, logo abaixo) */}
      <div className="w-full max-w-md mb-3">
        <TotemHeader
          backLabel="Voltar ao pedido"
          showContinueLater
          onBack={() => router.push("/totem/resumo")}
        />
      </div>

      {/* Stepper de progresso — separado do header */}
      <div className="w-full max-w-md mb-4 px-2">
        <FlowStepper steps={FLOW_STEPS} current={5} />
      </div>

      <div className="w-full max-w-md bg-canvas border border-hairline rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 bg-brand-primary text-on-primary flex items-center justify-between">
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
            <p className="text-body-md text-muted-foreground mb-2">Valor Total a Pagar</p>
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
