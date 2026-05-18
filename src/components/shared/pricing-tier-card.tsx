import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PricingTierCardProps {
  name: string;
  price: string;
  description?: string;
  features?: string[];
  cta?: ReactNode;
  featured?: boolean;
  className?: string;
}

export function PricingTierCard({
  name,
  price,
  description,
  features,
  cta,
  featured = false,
  className,
}: PricingTierCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-8 flex flex-col gap-5",
        featured
          ? "bg-surface-dark text-on-dark"
          : "bg-canvas text-ink border border-hairline",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-title-lg font-cal-body font-semibold leading-relaxed">
          {name}
        </h3>
        <span className="text-display-sm font-cal font-semibold leading-tight">
          {price}
        </span>
      </div>
      {description && (
        <p className="text-body-md font-cal-body font-normal leading-relaxed">
          {description}
        </p>
      )}
      {features && (
        <ul className="flex flex-col gap-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="text-body-md font-cal-body font-normal leading-relaxed flex items-center gap-2"
            >
              <span className="text-success">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      {cta && <div className="mt-auto">{cta}</div>}
    </div>
  );
}
