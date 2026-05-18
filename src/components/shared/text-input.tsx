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
          <label className="text-caption text-ink">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-11 px-4",
            "bg-canvas text-ink text-body-md",
            "border border-border rounded-pill",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:border-border focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:bg-secondary disabled:cursor-not-allowed",
            error && "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive",
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
