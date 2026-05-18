"use client";

import { Pencil, Trash2, CreditCard } from "lucide-react";

interface FormaPagamento {
  id: string;
  nome: string;
  descricao: string | null;
  permiteParcelamento: boolean;
  maximoParcelas: number;
  ativo: boolean;
}

interface FormasPagamentoTableProps {
  formas: FormaPagamento[];
  onEdit: (forma: FormaPagamento) => void;
  onToggleActive: (id: string, ativo: boolean) => void;
  onDelete: (id: string) => void;
}

export function FormasPagamentoTable({
  formas,
  onEdit,
  onToggleActive,
  onDelete,
}: FormasPagamentoTableProps) {
  if (formas.length === 0) {
    return (
      <div className="bg-surface-soft border border-hairline rounded-lg p-8 text-center">
        <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-body-md text-body">Nenhuma forma de pagamento cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {formas.map((forma) => (
        <div
          key={forma.id}
          className="bg-canvas border border-hairline rounded-lg overflow-hidden"
        >
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-title-sm text-ink">{forma.nome}</h3>
                {forma.descricao && (
                  <p className="text-body-md text-body mt-0.5">{forma.descricao}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forma.ativo}
                    onChange={() => onToggleActive(forma.id, !forma.ativo)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
                <span className={`text-xs font-medium ${forma.ativo ? "text-success" : "text-ink"}`}>
                  {forma.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(forma)}
                className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-ink"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(forma.id)}
                className="p-1.5 rounded hover:bg-surface-soft text-body hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Parcelas */}
          <div className="px-5 pb-3 flex flex-wrap gap-1.5">
            {Array.from(
              { length: forma.maximoParcelas },
              (_, i) => i + 1
            ).map((parcela) => (
              <span
                key={parcela}
                className={`inline-flex px-2.5 py-1 rounded-pill text-xs font-medium ${
                  parcela === 1
                    ? "bg-surface-soft text-muted"
                    : "bg-signature-cream text-ink"
                }`}
              >
                {parcela === 1 ? "à vista" : `${parcela}x`}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
