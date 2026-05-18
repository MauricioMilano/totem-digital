"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavPillSegment {
  label: string;
  href: string;
}

interface NavPillGroupProps {
  segments: NavPillSegment[];
  activeSegment: string;
  className?: string;
}

export function NavPillGroup({
  segments,
  activeSegment,
  className,
}: NavPillGroupProps) {
  return (
    <div
      className={cn(
        "bg-surface-soft rounded-pill px-1.5 py-1 inline-flex items-center gap-1",
        className
      )}
    >
      {segments.map((segment) => {
        const isActive = segment.label === activeSegment;

        return (
          <Link
            key={segment.label}
            href={segment.href}
            className={cn(
              "px-3.5 py-2 rounded-pill text-nav-link font-cal-body font-medium leading-relaxed transition-colors",
              isActive
                ? "bg-canvas text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                : "text-muted hover:text-ink"
            )}
          >
            {segment.label}
          </Link>
        );
      })}
    </div>
  );
}
