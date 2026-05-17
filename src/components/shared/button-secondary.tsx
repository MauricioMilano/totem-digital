import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonSecondaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const ButtonSecondary = forwardRef<HTMLButtonElement, ButtonSecondaryProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "bg-canvas text-ink text-button",
          "px-6 py-4 rounded-lg border border-hairline",
          "transition-all duration-150",
          "hover:bg-surface-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-border focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonSecondary.displayName = "ButtonSecondary";

export { ButtonSecondary };
