import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Rótulo exibido ao lado da seta (ex.: "Voltar", "Voltar para o início"). */
  label?: string;
}

/**
 * Botão de "voltar" padronizado do totem.
 *
 * Mantém a linguagem visual consistente em todas as telas: ícone de seta +
 * rótulo, com área de toque generosa e feedback de hover/focus claros.
 */
const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ className, children, label, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center gap-2 -ml-3 px-4 py-2 rounded-md",
          "border border-brand-primary/40 text-body-md text-body hover:text-ink transition-colors duration-150",
          "hover:border-brand-primary hover:bg-secondary/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className
        )}
        {...props}
      >
        <ArrowLeft className="w-4 h-4" />
        {label ?? children}
      </button>
    );
  }
);
BackButton.displayName = "BackButton";

export { BackButton };
