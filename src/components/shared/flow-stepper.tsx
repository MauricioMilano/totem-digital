import { cn } from "@/lib/utils";

type FlowStepperStep = string | { label: string };

interface FlowStepperProps {
  /** Ordem das etapas (Serviços, Bebidas, Produtos, Resumo...). */
  steps: FlowStepperStep[];
  /** Índice da etapa atual, baseado em 1 (ex.: 3 = terceira etapa). */
  current: number;
  /** Classe extra para ajuste no container. */
  className?: string;
}

/**
 * Indicador visual de progresso do fluxo do totem.
 * Reutiliza as classes de design-system já existentes (brand-primary,
 * surface-soft, hairline, etc.), sem adicionar dependências externas.
 */
export function FlowStepper({ steps, current, className }: FlowStepperProps) {
  return (
    <nav
      aria-label="Etapas do pedido"
      className={cn(
        "sticky top-3 z-30 flex items-center justify-between gap-1 sm:gap-2 rounded-full bg-white/90 backdrop-blur border border-hairline shadow-lg px-3 py-2",
        className
      )}
    >
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCurrent = stepNumber === current;
        const isCompleted = stepNumber < current;
        const label = typeof step === "string" ? step : step.label;

        return (
          <div key={stepNumber} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={cn(
                "w-7 sm:w-9 h-7 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border transition-colors",
                isCurrent
                  ? "bg-brand-primary border-brand-primary text-white"
                  : isCompleted
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "bg-surface-soft border-hairline text-body"
              )}
              aria-hidden={true}
            >
              {isCompleted ? "✓" : stepNumber}
            </div>
            <span
              className={cn(
                "text-caption text-center leading-tight",
                isCurrent || isCompleted ? "text-ink font-bold" : "text-body"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
