"use client";

import { useState } from "react";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comandaId: string;
  clienteNome: string;
  total: number;
  formaPagamento: string | null;
  quantidadeParcelas: number;
  onSuccess: () => void;
}

export function PagamentoModal({
  open,
  onOpenChange,
  comandaId,
  clienteNome,
  total,
  formaPagamento,
  quantidadeParcelas,
  onSuccess,
}: PagamentoModalProps) {
  const [loading, setLoading] = useState(false);

  async function handlePagar() {
    setLoading(true);
    try {
      const res = await fetch(`/api/comandas/${comandaId}/pagar`, {
        method: "POST",
      });

      if (!res.ok) throw new Error();
      toast.success("Comanda paga com sucesso!");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-title-md text-ink">
            Confirmar Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-surface-soft rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-body-md text-body">Cliente</span>
              <span className="text-body-md text-ink font-medium">{clienteNome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body-md text-body">Forma de Pagamento</span>
              <span className="text-body-md text-ink font-medium">
                {formaPagamento || "—"}
              </span>
            </div>
            {quantidadeParcelas > 1 && (
              <div className="flex justify-between">
                <span className="text-body-md text-body">Parcelas</span>
                <span className="text-body-md text-ink font-medium">
                  {quantidadeParcelas}x de R$ {(total / quantidadeParcelas).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-hairline">
              <span className="text-title-sm text-ink">Total</span>
              <span className="text-title-sm text-ink font-medium">
                R$ {total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <ButtonSecondary
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </ButtonSecondary>
            <ButtonPrimary
              onClick={handlePagar}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Processando..." : "Confirmar Pagamento"}
            </ButtonPrimary>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
