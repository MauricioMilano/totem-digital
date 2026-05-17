import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-caption text-body">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-4 py-3",
            "bg-canvas text-ink text-body-md",
            "border border-hairline rounded-sm",
            "placeholder:text-muted/60",
            "focus:outline-none focus:border-info-border focus:ring-1 focus:ring-info-border",
            "disabled:bg-surface-soft disabled:cursor-not-allowed",
            error && "border-destructive/70 focus:border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-destructive mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";

export { TextInput };
