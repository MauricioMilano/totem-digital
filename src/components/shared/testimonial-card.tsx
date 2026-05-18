import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TestimonialCardProps {
  avatar?: ReactNode;
  name: string;
  role: string;
  quote: string;
  className?: string;
}

export function TestimonialCard({ avatar, name, role, quote, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-card rounded-lg p-6 flex flex-col gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {avatar && <div className="w-9 h-9 rounded-full">{avatar}</div>}
        <div className="flex flex-col gap-0.5">
          <span className="text-title-sm font-cal-body font-semibold text-ink">
            {name}
          </span>
          <span className="text-body-sm font-cal-body font-normal text-muted">
            {role}
          </span>
        </div>
      </div>
      <blockquote className="text-body-md font-cal-body font-normal leading-relaxed text-body">
        {quote}
      </blockquote>
    </div>
  );
}
