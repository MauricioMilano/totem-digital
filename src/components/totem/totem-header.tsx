"use client";

import { BackButton } from "@/components/shared/back-button";
import { ContinueLaterButton } from "@/components/totem/continue-later-button";
import { cn } from "@/lib/utils";

interface TotemHeaderProps {
  /** Rótulo do botão de voltar (esquerda). Se informado, o BackButton é renderizado. */
  backLabel?: string;
  /** Ação ao clicar em voltar. */
  onBack?: () => void;
  /** Mostra o botão "Continuar depois" à direita. */
  showContinueLater?: boolean;
  /** Conteúdo interno (título, ações, etc.) renderizado entre o voltar e a direita. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Header padronizado do totem.
 *
 * Barra superior reutilizada em todas as telas (fluxo de pedido, consulta da
 * comanda, identificação e continuar como convidado). O stepper de progresso é
 * um componente SEPARADO (`FlowStepper`) e fica fora do header.
 *
 * - Esquerda: BackButton opcional (`backLabel` + `onBack`).
 * - Centro/direita: conteúdo interno via `children`.
 * - Direita: botão "Continuar depois" opcional (`showContinueLater`).
 */
export function TotemHeader({
  backLabel,
  onBack,
  showContinueLater,
  children,
  className,
}: TotemHeaderProps) {
  return (
    <header className={cn("px-6 py-4 border-b border-hairline", className)}>
      <div className="flex items-center justify-between gap-2">
        {backLabel ? (
          <BackButton label={backLabel} onClick={onBack} />
        ) : (
          <span aria-hidden="true" />
        )}

        {children && <div className="flex-1 min-w-0">{children}</div>}

        {showContinueLater && <ContinueLaterButton />}
      </div>
    </header>
  );
}
