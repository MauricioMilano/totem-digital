"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { useTotemSession } from "@/hooks/use-totem-session";
import { toast } from "sonner";
import { TotemDrawer } from "@/components/totem/totem-drawer";

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export default function TotemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { getLastActivity, updateLastActivity } = useTotemSession();

  useEffect(() => {
    const checkTimeout = () => {
      const last = getLastActivity();
      if (last && Date.now() - last > SESSION_TIMEOUT) {
        toast.error("Sessão expirada por inatividade. Voltando ao início.", {
          duration: 5000,
        });
        router.push("/totem");
      }
    };

    const interval = setInterval(() => {
      checkTimeout();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [getLastActivity, router]);

  useEffect(() => {
    updateLastActivity();
  }, [updateLastActivity]);

  return (
    <div className="min-h-screen bg-canvas">
      {children}
      <TotemDrawer />
      <Toaster />
    </div>
  );
}
