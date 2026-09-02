"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Hourglass } from "lucide-react";
import { FlowStepper } from "@/components/shared/flow-stepper";
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

const FLOW_STEPS = ["Serviços", "Bebidas", "Produtos", "Resumo", "Pagamento"];

interface TotemFlowHeaderProps {
  /** Etapa atual (1 a 5) para o indicador de progresso. */
  current: number;
  /** Rótulo do botão de voltar (ex.: "Voltar às bebidas"). */
  backLabel: string;
  /** Ação ao clicar em voltar (retorna 1 etapa no flow). */
  onBack: () => void;
}

/**
 * Cabeçalho padronizado do fluxo de pedido do totem.
 *
 * - "Voltar" (esquerda): retorna 1 etapa no flow, sem alterar a comanda/carrinho.
 * - "Continuar depois" (direita): pausa o atendimento — volta ao início mantendo a
 *   comanda aberta. Se já existe comanda persistida no servidor (comandaId), limpa
 *   a sessão local (os itens estão seguros no banco e podem ser retomados por
 *   Minha Conta). Se ainda não há comanda no servidor, preserva o carrinho local
 *   para não perder itens que ainda não foram persistidos.
 */
export function TotemFlowHeader({ current, backLabel, onBack }: TotemFlowHeaderProps) {
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
      <div className="px-6 py-4 border-b border-hairline">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </button>

          <button
            onClick={() => setShowPauseDialog(true)}
            aria-label="Continuar depois"
            className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
          >
            <Hourglass className="w-4 h-4" />
            Continuar depois
          </button>
        </div>

        <FlowStepper steps={FLOW_STEPS} current={current} />
      </div>

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
