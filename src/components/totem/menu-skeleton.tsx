"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton padronizado de loading das telas de cardápio do totem
 * (serviços, bebidas e produtos).
 */
export function MenuSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3 rounded-xl border border-hairline bg-surface-card space-y-3">
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
