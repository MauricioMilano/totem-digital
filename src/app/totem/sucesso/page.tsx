"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { CheckCircle, Scissors } from "lucide-react";
import { useTotemSession } from "@/hooks/use-totem-session";

export default function SucessoPage() {
  const router = useRouter();
  const { getComandaId, clearTotemSession } = useTotemSession();
  const [comandaId, setComandaIdState] = useState<string | null>(null);

  useEffect(() => {
    const id = getComandaId();
    if (!id) {
      router.push("/totem");
      return;
    }
    setComandaIdState(id);
    clearTotemSession();
  }, [router]);

  function handleNovaComanda() {
    clearTotemSession();
    router.push("/totem");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Signature Coral Card — brand voltage moment */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="bg-signature-coral rounded-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-display-md text-white mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-body-md text-white/80 mb-2">
              Sua comanda foi paga com sucesso.
            </p>
            {comandaId && (
              <p className="text-caption text-white/60 font-mono">
                #{comandaId.slice(-8).toUpperCase()}
              </p>
            )}
            <div className="mt-8">
              <p className="text-body-md text-white/80 mb-4">
                Agora é só aguardar ser chamado pelo barbeiro.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-md text-white/80 text-body-md">
                <Scissors className="w-4 h-4" />
                Fique à vontade!
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <ButtonPrimary onClick={handleNovaComanda} className="w-full">
              Nova Comanda
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
}
