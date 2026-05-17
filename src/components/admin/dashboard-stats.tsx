import { Scissors, Users, FileText, DollarSign, CalendarDays } from "lucide-react";

interface DashboardStatsProps {
  comandasAbertas: number;
  totalClientes: number;
  totalServicos: number;
  comandasHoje: number;
  faturamentoHoje: number;
}

export function DashboardStats({
  comandasAbertas,
  totalClientes,
  totalServicos,
  comandasHoje,
  faturamentoHoje,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "Comandas Abertas",
      value: comandasAbertas,
      icon: FileText,
      color: "text-signature-coral",
      bg: "bg-signature-coral/5",
    },
    {
      label: "Clientes",
      value: totalClientes,
      icon: Users,
      color: "text-link",
      bg: "bg-link/5",
    },
    {
      label: "Serviços Ativos",
      value: totalServicos,
      icon: Scissors,
      color: "text-signature-forest",
      bg: "bg-signature-forest/5",
    },
    {
      label: "Comandas Hoje",
      value: comandasHoje,
      icon: CalendarDays,
      color: "text-signature-peach",
      bg: "bg-signature-peach/10",
    },
    {
      label: "Faturamento Hoje",
      value: `R$ ${faturamentoHoje.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success",
      bg: "bg-success/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-canvas border border-hairline rounded-lg p-5 flex items-start gap-4"
          >
            <div className={`p-2.5 rounded-md ${stat.bg}`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-caption text-muted">{stat.label}</p>
              <p className="text-title-md text-ink mt-0.5">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
