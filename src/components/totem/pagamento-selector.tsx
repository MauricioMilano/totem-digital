"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Banknote, Smartphone } from "lucide-react";

interface FormaPagamento {
  id: string;
  nome: string;
  descricao: string | null;
  permiteParcelamento: boolean;
  maximoParcelas: number;
  ativo: boolean;
}

interface PagamentoSelectorProps {
  formaPagamentoId: string | null;
  quantidadeParcelas: number;
  total: number;
  onSelectForma: (id: string, nome: string, maxParcelas: number) => void;
  onSelectParcelas: (qtd: number) => void;
}

function getIcon(nome: string) {
  const lower = nome.toLowerCase();
  if (lower.includes("pix")) return Smartphone;
  if (lower.includes("crédito") || lower.includes("debito") || lower.includes("cartão")) return CreditCard;
  return Banknote;
}

export function PagamentoSelector({
  formaPagamentoId,
  quantidadeParcelas,
  total,
  onSelectForma,
  onSelectParcelas,
}: PagamentoSelectorProps) {
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs para acessar os valores mais recentes sem re-executar o efeito de fetch
  // (evita refetch quando formaPagamentoId muda após a auto-seleção).
  const onSelectFormaRef = useRef(onSelectForma);
  const formaPagamentoIdRef = useRef(formaPagamentoId);

  useEffect(() => {
    onSelectFormaRef.current = onSelectForma;
    formaPagamentoIdRef.current = formaPagamentoId;
  });

  useEffect(() => {
    fetch("/api/formas-pagamento")
      .then((res) => res.json())
      .then((data) => {
        setFormas(data);
        // Auto-select first if none selected
        if (!formaPagamentoIdRef.current && data.length > 0) {
          onSelectFormaRef.current(data[0].id, data[0].nome, data[0].maximoParcelas);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedForma = formas.find((f) => f.id === formaPagamentoId);

  if (loading) {
    return <div className="text-body-md text-muted-foreground py-4">Carregando formas de pagamento...</div>;
  }

  if (formas.length === 0) {
    return <div className="text-body-md text-muted-foreground py-4">Nenhuma forma de pagamento disponível</div>;
  }

  return (
    <div className="space-y-3">
      <p className="text-caption text-muted-foreground uppercase tracking-wide mb-2">
        Forma de Pagamento
      </p>

      {formas.map((forma) => {
        const Icon = getIcon(forma.nome);
        const isSelected = forma.id === formaPagamentoId;

        return (
          <div key={forma.id} className="space-y-2">
            <button
              onClick={() =>
                onSelectForma(forma.id, forma.nome, forma.maximoParcelas)
              }
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                isSelected
                  ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                  : "border-hairline bg-canvas hover:border-border-strong"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-brand-primary" : "border-hairline"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                  )}
                </div>
                <Icon className="w-5 h-5 text-body" />
                <div className="flex-1">
                  <span className="text-body-md font-medium text-ink">
                    {forma.nome}
                  </span>
                  {forma.descricao && (
                    <span className="text-caption text-muted-foreground ml-2">
                      {forma.descricao}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Parcelas - only show when this form is selected and allows parcelamento */}
            {isSelected && forma.permiteParcelamento && forma.maximoParcelas > 1 && (
              <div className="pl-9">
                <div className="flex flex-wrap gap-2 p-3 bg-surface-soft rounded-lg">
                  {Array.from(
                    { length: forma.maximoParcelas },
                    (_, i) => i + 1
                  ).map((parcela) => {
                    const valorParcela = total / parcela;
                    return (
                      <button
                        key={parcela}
                        onClick={() => onSelectParcelas(parcela)}
                        className={`px-3 py-2 rounded-md text-body-md border transition-colors ${
                          quantidadeParcelas === parcela
                            ? "bg-brand-primary text-on-primary border-brand-primary"
                            : "bg-canvas text-ink border-hairline hover:border-border-strong"
                        }`}
                      >
                        {parcela === 1
                          ? "À vista"
                          : `${parcela}x R$ ${valorParcela.toFixed(2)}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* À vista indicator for non-parcelamento forms */}
            {isSelected && !forma.permiteParcelamento && (
              <div className="pl-9">
                <div className="p-3 bg-surface-soft rounded-lg">
                  <span className="text-body-md text-success font-medium">
                    Pagamento à vista
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
