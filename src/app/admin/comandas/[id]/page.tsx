"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { PagamentoModal } from "@/components/admin/pagamento-modal";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";

interface Comanda {
  id: string;
  cliente: { id: string; nome: string; cpf: string } | null;
  usuario: { id: string; nome: string } | null;
  formaPagamento: { id: string; nome: string } | null;
  quantidadeParcelas: number;
  status: string;
  total: number;
  observacao: string | null;
  fechadaEm: string | null;
  pagaEm: string | null;
  createdAt: string;
  itens: Array<{
    id: string;
    nomeItem: string;
    precoUnit: number;
    quantidade: number;
    total: number;
    servico: any | null;
    bebida: any | null;
    produto: any | null;
  }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ABERTA: { label: "Aberta", color: "bg-blue-50 text-blue-700" },
  PAGA: { label: "Paga", color: "bg-green-50 text-green-700" },
  CANCELADA: { label: "Cancelada", color: "bg-red-50 text-red-700" },
};

export default function ComandaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [comanda, setComanda] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);

  async function loadComanda() {
    try {
      const res = await fetch(`/api/comandas/${params.id}`);
      if (res.status === 404) {
        toast.error("Comanda não encontrada");
        router.push("/comandas");
        return;
      }
      const data = await res.json();
      setComanda(data);
    } catch {
      toast.error("Erro ao carregar comanda");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadComanda(); }, [params.id]);

  async function handleReabrir() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/comandas/${params.id}/reabrir`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Comanda reaberta");
      loadComanda();
    } catch {
      toast.error("Erro ao reabrir comanda");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-body-md text-body">Carregando...</div>
      </div>
    );
  }

  if (!comanda) return null;

  const status = statusConfig[comanda.status] || { label: comanda.status, color: "bg-secondary text-secondary-foreground" };
  const podePagar = comanda.status === "ABERTA";

  return (
    <div className="max-w-3xl space-y-6">
      <button
        onClick={() => router.push("/comandas")}
        className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar às comandas
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-display-md text-ink">
            Comanda #{comanda.id.slice(-8).toUpperCase()}
          </h1>
           <p className="text-body-md text-body mt-1">
             {comanda.cliente 
               ? `${comanda.cliente.nome} · ${comanda.cliente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}`
               : "Cliente Convidado"}
           </p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-pill text-sm font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Payment info */}
      <div className="bg-surface-soft rounded-lg p-4 flex items-center gap-6">
        <div>
          <p className="text-caption text-body">Forma de Pagamento</p>
          <p className="text-body-md text-ink font-medium">
            {comanda.formaPagamento?.nome || "Não definido"}
          </p>
        </div>
        <div>
          <p className="text-caption text-body">Parcelas</p>
          <p className="text-body-md text-ink font-medium">
            {comanda.quantidadeParcelas > 1
              ? `${comanda.quantidadeParcelas}x`
              : "À vista"}
          </p>
        </div>
        <div>
          <p className="text-caption text-body">Total</p>
          <p className="text-body-md text-ink font-medium">
            R$ {Number(comanda.total).toFixed(2)}
          </p>
        </div>
        {comanda.pagaEm && (
          <div>
            <p className="text-caption text-body">Pago em</p>
            <p className="text-body-md text-ink font-medium">
              {new Date(comanda.pagaEm).toLocaleString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      {/* Itens */}
      <div>
        <h2 className="text-title-md text-ink mb-3">Itens</h2>
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden">
          <table className="w-full text-body-md">
            <thead>
              <tr className="border-b border-hairline bg-surface-soft">
                <th className="text-left px-4 py-3 text-caption text-body">Item</th>
                <th className="text-right px-4 py-3 text-caption text-body">Preço Unit.</th>
                <th className="text-center px-4 py-3 text-caption text-body">Qtd</th>
                <th className="text-right px-4 py-3 text-caption text-body">Total</th>
              </tr>
            </thead>
            <tbody>
              {comanda.itens.map((item) => (
                <tr key={item.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 text-ink">{item.nomeItem}</td>
                  <td className="px-4 py-3 text-right text-body">
                    R$ {Number(item.precoUnit).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center text-body">{item.quantidade}</td>
                  <td className="px-4 py-3 text-right text-ink font-medium">
                    R$ {Number(item.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-hairline bg-surface-soft">
                <td colSpan={3} className="px-4 py-3 text-right text-title-sm text-ink">
                  Total
                </td>
                <td className="px-4 py-3 text-right text-title-sm text-ink font-medium">
                  R$ {Number(comanda.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {podePagar && (
          <ButtonPrimary onClick={() => setShowPagamento(true)}>
            Registrar Pagamento
          </ButtonPrimary>
        )}
      </div>

       <PagamentoModal
         open={showPagamento}
         onOpenChange={setShowPagamento}
         comandaId={comanda.id}
         clienteNome={comanda.cliente?.nome || "Convidado"}
         total={Number(comanda.total)}
         formaPagamento={comanda.formaPagamento?.nome || null}
         quantidadeParcelas={comanda.quantidadeParcelas}
         onSuccess={loadComanda}
       />
    </div>
  );
}
