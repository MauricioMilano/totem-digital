import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-card rounded-lg p-8 flex flex-col gap-4",
        className
      )}
    >
      {icon && <div className="text-ink">{icon}</div>}
      <h3 className="text-title-md font-cal-body font-semibold leading-relaxed text-ink">
        {title}
      </h3>
      <p className="text-body-md font-cal-body font-normal leading-relaxed text-body">
        {description}
      </p>
    </div>
  );
}
