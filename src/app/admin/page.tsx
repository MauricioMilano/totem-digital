import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [
    totalComandasAbertas,
    totalClientes,
    totalServicos,
    totalComandasHoje,
  ] = await Promise.all([
    prisma.comanda.count({ where: { status: "ABERTA" } }),
    prisma.cliente.count(),
    prisma.servico.count({ where: { ativo: true } }),
    prisma.comanda.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const ultimasComandas = await prisma.comanda.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      cliente: true,
      formaPagamento: true,
      itens: true,
    },
  });

  const faturamentoHoje = await prisma.comanda.aggregate({
    _sum: { total: true },
    where: {
      status: "PAGA",
      pagaEm: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-md text-ink">Dashboard</h1>
        <p className="text-body-md text-body mt-1">
          Bem-vindo, {session.user?.name}!
        </p>
      </div>

      <DashboardStats
        comandasAbertas={totalComandasAbertas}
        totalClientes={totalClientes}
        totalServicos={totalServicos}
        comandasHoje={totalComandasHoje}
        faturamentoHoje={Number(faturamentoHoje._sum.total) || 0}
      />

      <div>
        <h2 className="text-title-md text-ink mb-4">Últimas Comandas</h2>
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <table className="w-full text-body-md">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Pagamento</th>
                <th className="text-right px-4 py-3 text-caption text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {ultimasComandas.map((comanda) => (
                <tr key={comanda.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 text-ink">{comanda.cliente?.nome || "Convidado"}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded-pill text-xs font-medium",
                      comanda.status === "ABERTA" && "bg-blue-50 text-blue-700",
                      comanda.status === "EM_ANDAMENTO" && "bg-yellow-50 text-yellow-700",
                      comanda.status === "FECHADA" && "bg-secondary text-ink font-medium",
                      comanda.status === "PAGA" && "bg-green-50 text-green-700",
                    )}>
                      {statusLabel(comanda.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body">
                    {comanda.formaPagamento?.nome || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-ink font-medium">
                    R$ {Number(comanda.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-body">
                    {new Date(comanda.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {ultimasComandas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-body">
                    Nenhuma comanda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ABERTA: "Aberta",
    EM_ANDAMENTO: "Em Andamento",
    FECHADA: "Fechada",
    PAGA: "Paga",
    CANCELADA: "Cancelada",
  };
  return map[status] || status;
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
