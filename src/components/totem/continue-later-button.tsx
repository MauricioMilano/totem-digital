"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hourglass } from "lucide-react";
import { useTotemSession } from "@/hooks/use-totem-session";
import { limparComanda } from "@/hooks/use-comanda";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ContinueLaterButtonProps {
  /** Classe extra para o botão gatilho. */
  className?: string;
}

/**
 * Botão "Continuar depois" padronizado do totem.
 *
 * Pausa o atendimento — volta ao início mantendo a comanda aberta. Se já existe
 * comanda persistida no servidor (comandaId), limpa a sessão local (os itens
 * estão seguros no banco e podem ser retomados por Minha Conta). Se ainda não há
 * comanda no servidor, preserva o carrinho local para não perder itens que
 * ainda não foram persistidos.
 */
export function ContinueLaterButton({ className }: ContinueLaterButtonProps) {
  const router = useRouter();
  const { getComandaId } = useTotemSession();
  const [showPauseDialog, setShowPauseDialog] = useState(false);

  function handleContinueLater() {
    const comandaId = getComandaId();
    if (comandaId) {
      // Comanda já criada no servidor e ABERTA: itens seguros, limpa estado local.
      limparComanda();
    }
    // Sem comanda no servidor: mantém o carrinho/sessão para não perder itens.
    setShowPauseDialog(false);
    router.push("/totem");
  }

  return (
    <>
      <button
        onClick={() => setShowPauseDialog(true)}
        aria-label="Continuar depois"
        className={
          "inline-flex items-center gap-2 px-4 py-2 rounded-md border border-brand-primary/40 text-body-md text-body hover:text-ink transition-colors duration-150 hover:border-brand-primary hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary " +
          (className ?? "")
        }
      >
        <Hourglass className="w-4 h-4" />
        Continuar depois
      </button>

      {/* Confirmação de pausa */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="sm:max-w-md bg-canvas border-hairline">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
              <Hourglass className="w-6 h-6 text-brand-primary" />
            </div>
            <DialogTitle className="text-display-sm font-cal text-ink">Continuar depois?</DialogTitle>
            <DialogDescription className="text-body-md text-body pt-2">
              Você será levado de volta ao início. Sua comanda continua aberta e você pode
              retomar quando quiser pela aba "Minha Conta".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-3 sm:flex-row-reverse mt-6">
            <button
              onClick={handleContinueLater}
              className="flex-1 py-4 text-body-md font-bold text-on-primary bg-brand-primary rounded-lg hover:bg-brand-primary-active transition-colors"
            >
              Continuar depois
            </button>
            <button
              onClick={() => setShowPauseDialog(false)}
              className="flex-1 py-4 text-body-md font-bold text-ink border border-hairline rounded-lg bg-canvas hover:bg-surface-card transition-colors"
            >
              Cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
