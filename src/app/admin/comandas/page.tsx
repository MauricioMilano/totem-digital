"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { FileText, Search } from "lucide-react";

interface Comanda {
  id: string;
  cliente: { nome: string } | null;
  formaPagamento: { nome: string } | null;
  total: number;
  status: string;
  quantidadeParcelas: number;
  createdAt: string;
  itens: any[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ABERTA: { label: "Aberta", color: "bg-blue-50 text-blue-700" },
  EM_ANDAMENTO: { label: "Em Andamento", color: "bg-yellow-50 text-yellow-700" },
   FECHADA: { label: "Fechada", color: "bg-secondary text-secondary-foreground" },
  PAGA: { label: "Paga", color: "bg-green-50 text-green-700" },
  CANCELADA: { label: "Cancelada", color: "bg-red-50 text-red-700" },
};

export default function ComandasPage() {
  const router = useRouter();
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>("ABERTA");

  async function loadComandas() {
    try {
      const url = filtroStatus
        ? `/api/comandas?status=${filtroStatus}`
        : "/api/comandas?status=ABERTA";
      const res = await fetch(url);
      const data = await res.json();
      setComandas(data);
    } catch {
      toast.error("Erro ao carregar comandas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadComandas();
  }, [filtroStatus]);

  const statusFiltros = [
    { value: "ABERTA", label: "Abertas" },
    { value: "EM_ANDAMENTO", label: "Em Andamento" },
    { value: "FECHADA", label: "Fechadas" },
    { value: "PAGA", label: "Pagas" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-md text-ink">Comandas</h1>
        <p className="text-body-md text-body mt-1">Gerencie as comandas dos clientes</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusFiltros.map((filtro) => (
          <button
            key={filtro.value}
            onClick={() => setFiltroStatus(filtro.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-body-md transition-colors ${
              filtroStatus === filtro.value
                ? "bg-brand-primary text-white"
                : "bg-surface-soft text-body hover:text-ink"
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-body-md text-muted-foreground py-8">Carregando...</div>
      ) : (
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <table className="w-full text-body-md">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Pagamento</th>
                <th className="text-center px-4 py-3 text-caption text-muted-foreground">Parcelas</th>
                <th className="text-right px-4 py-3 text-caption text-muted-foreground">Total</th>
                <th className="text-right px-4 py-3 text-caption text-muted-foreground">Itens</th>
                <th className="text-left px-4 py-3 text-caption text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {comandas.map((comanda) => {
                 const status = statusConfig[comanda.status] || { label: comanda.status, color: "bg-secondary text-secondary-foreground" };
                return (
                  <tr
                    key={comanda.id}
                    className="border-b border-hairline last:border-0 cursor-pointer hover:bg-surface-soft/50 transition-colors"
                    onClick={() => router.push(`/comandas/${comanda.id}`)}
                  >
                    <td className="px-4 py-3 text-ink font-medium">{comanda.cliente?.nome || "Convidado"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-pill text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body">
                      {comanda.formaPagamento?.nome || "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-body">
                      {comanda.quantidadeParcelas > 1
                        ? `${comanda.quantidadeParcelas}x`
                        : "À vista"}
                    </td>
                    <td className="px-4 py-3 text-right text-ink font-medium">
                      R$ {Number(comanda.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-body">
                      {comanda.itens.length}
                    </td>
                    <td className="px-4 py-3 text-body">
                      {new Date(comanda.createdAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              {comandas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-body">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    Nenhuma comanda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
