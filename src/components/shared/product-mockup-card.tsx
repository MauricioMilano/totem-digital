import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ProductMockupCardProps {
  children: ReactNode;
  className?: string;
}

export function ProductMockupCard({ children, className }: ProductMockupCardProps) {
  return (
    <div
      className={cn(
        "bg-canvas rounded-lg p-6 border border-hairline",
        className
      )}
    >
      {children}
    </div>
  );
}
