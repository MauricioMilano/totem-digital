"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { TextInput } from "@/components/shared/text-input";
import { ArrowLeft, Search, Ticket } from "lucide-react";
import { setCliente, setCustomerStatus } from "@/hooks/use-comanda";
import { setComandaId } from "@/hooks/use-totem-session";

export default function MinhaContaPage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) {
      setError("Informe seu CPF, telefone ou código de recibo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/comandas/totem/consulta?code=${encodeURIComponent(raw)}`);

      if (res.status === 404) {
        setError("Nenhuma comanda aberta encontrada. Verifique os dados informados.");
        return;
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      const comanda = data.comanda;

      // Restore session so downstream pages (minha-comanda, pagamento) work.
      if (data.tipo !== "recibo" && comanda.cliente) {
        setCliente(comanda.cliente.id, comanda.cliente.nome, comanda.cliente.cpf);
      } else {
        // Guest: no client identity — mark as guest; the comanda id is how we find it.
        setCustomerStatus("GUEST");
      }
      setComandaId(comanda.id);

      router.push("/totem/minha-comanda");
    } catch {
      setError("Não foi possível consultar sua comanda. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Header */}
      <div className="px-6 py-6 border-b border-hairline bg-canvas sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/totem")}
            className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-title-md font-cal text-ink">Minha Conta</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <Search className="w-6 h-6 text-ink" />
          </div>
          <h2 className="text-display-md text-ink mb-2">Consultar minha comanda</h2>
          <p className="text-body-md text-body">
            Informe seu CPF, telefone ou o código de recibo que você recebeu.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-5">
          <TextInput
            label="CPF, telefone ou código"
            placeholder="000.000.000-00 · (11) 99999-9999 · K7X2QP"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={error}
            autoFocus
          />

          <ButtonPrimary type="submit" disabled={loading} className="w-full py-6 text-lg flex items-center justify-center gap-2">
            {loading ? (
              "Consultando..."
            ) : (
              <>
                <Search className="w-5 h-5" />
                Consultar
              </>
            )}
          </ButtonPrimary>
        </form>

        <div className="mt-10 bg-surface-soft border border-hairline rounded-lg p-4 flex items-start gap-3">
          <Ticket className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <p className="text-body-sm text-body leading-relaxed">
            <span className="font-medium text-ink">Convidado sem CPF?</span> Ao finalizar seu
            pedido você recebe um código de recibo. Guarde-o para consultar sua comanda depois.
          </p>
        </div>
      </div>
    </div>
  );
}
