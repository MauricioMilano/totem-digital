"use client";

import { useSession } from "next-auth/react";

export function TopNav() {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-canvas border-b border-hairline flex items-center justify-end px-6">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-brand-primary text-on-primary flex items-center justify-center text-xs font-medium">
          {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <span className="text-body-md text-body">{session?.user?.name || "Admin"}</span>
      </div>
    </header>
  );
}
