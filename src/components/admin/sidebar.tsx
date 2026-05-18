"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Scissors,
  Wine,
  Package,
  CreditCard,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/servicos", label: "Serviços", icon: Scissors },
  { href: "/admin/cardapio/bebidas", label: "Bebidas", icon: Wine },
  { href: "/admin/cardapio/produtos", label: "Produtos", icon: Package },
  { href: "/admin/cardapio/formas-pagamento", label: "Formas de Pagamento", icon: CreditCard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/comandas", label: "Comandas", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-canvas border-r border-hairline flex flex-col">
      <div className="px-6 py-5 border-b border-hairline">
        <Link href="/" className="text-title-sm text-ink font-cal">
          Barbearia
        </Link>
        <p className="text-caption text-muted-foreground mt-0.5">Área Profissional</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                 "flex items-center gap-3 px-3 py-2.5 rounded-pill text-body-md transition-colors",
                isActive
                  ? "bg-surface-soft text-ink font-medium"
                  : "text-body hover:bg-surface-soft hover:text-ink"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-hairline">
        <button
           onClick={() => signOut({ callbackUrl: "/admin/login" })}
           className="flex items-center gap-3 px-3 py-2.5 rounded-pill text-body-md text-body hover:bg-surface-soft hover:text-ink w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
