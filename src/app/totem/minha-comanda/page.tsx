"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
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
import { FlowStepper } from "@/components/shared/flow-stepper";

interface ComandaItem {
  id: string;
  nomeItem: string;
  precoUnit: number;
  quantidade: number;
  total: number;
}

interface Comanda {
  id: string;
  total: number;
  itens: ComandaItem[];
  cliente: { nome: string } | null;
}

export default function MinhaComandaPage() {
  const router = useRouter();
  const { getCliente, getComandaId } = useTotemSession();
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(true);

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
        router.push("/totem/minha-conta");
      } finally {
        setLoading(false);
      }
    }

    fetchComanda();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-body-md text-muted-foreground">Carregando sua comanda...</div>
      </div>
    );
  }

  if (!comanda) return null;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 bg-surface-soft">
      {/* Back button */}
      <button
        onClick={() => router.push("/totem")}
        className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors mb-6 self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="w-full max-w-md bg-canvas border border-hairline rounded-3xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-brand-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <h1 className="text-title-md font-medium">Minha Comanda</h1>
          </div>
          <span className="text-body-sm opacity-90">
            {comanda.cliente?.nome || "Cliente"}
          </span>
        </div>

        {/* Items List */}
        <div className="p-6 space-y-4">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {comanda.itens.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-hairline last:border-0">
                <div>
                  <p className="text-body-md text-ink font-medium">{item.nomeItem}</p>
                  <p className="text-caption text-body">
                    {item.quantidade}x R$ {Number(item.precoUnit).toFixed(2)}
                  </p>
                </div>
                <p className="text-body-md text-ink font-medium">
                  R$ {Number(item.total).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-4 mt-4 border-t-2 border-hairline flex justify-between items-center">
            <span className="text-title-sm text-ink font-bold">Total a Pagar</span>
            <span className="text-display-sm text-brand-primary font-black">
              R$ {Number(comanda.total).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-surface-soft flex flex-col gap-3">
          <ButtonPrimary 
            onClick={() => router.push("/totem/pagamento")} 
            className="w-full py-6 text-lg flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Pagar Comanda
          </ButtonPrimary>
          
          <ButtonSecondary 
            onClick={() => router.push("/totem")} 
            className="w-full py-4"
          >
            Voltar para Início
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
