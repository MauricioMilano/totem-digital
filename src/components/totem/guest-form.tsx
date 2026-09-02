"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { toast } from "sonner";
import { User } from "lucide-react";
import { TotemHeader } from "@/components/totem/totem-header";
import { setCustomerStatus } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { formatPhone } from "@/lib/totem-utils";

interface GuestFormProps {
  onBack: () => void;
  onCancel?: () => void;
}

export function GuestForm({ onBack, onCancel }: GuestFormProps) {
  const router = useRouter();
  const { updateLastActivity, setGuestInfo, getGuestInfo } = useTotemSession();

  const [nome, setNome] = useState(() => {
    const existing = typeof window !== "undefined" ? getGuestInfo() : null;
    return existing?.nome ?? "";
  });
  const [telefone, setTelefone] = useState(() => {
    const existing = typeof window !== "undefined" ? getGuestInfo() : null;
    return existing?.telefone ?? "";
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe seu nome para continuar");
      return;
    }

    setLoading(true);
    try {
      setCustomerStatus("GUEST");
      setGuestInfo({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, "") || undefined,
      });
      updateLastActivity();
      router.push("/totem/servicos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Header padronizado */}
      <TotemHeader backLabel="Voltar" onBack={onBack} />

      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <User className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-1">Continuar como Convidado</h1>
          <p className="text-body-md text-body">
            Informe seu nome para identificarmos sua comanda. Não é necessário cadastro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Nome"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            autoFocus
          />
          <TextInput
            label="Telefone (opcional)"
            placeholder="(11) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(formatPhone(e.target.value))}
          />

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <ButtonSecondary type="button" onClick={onCancel} className="flex-1">
                Cancelar
              </ButtonSecondary>
            )}
            <ButtonPrimary type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Continuar"}
            </ButtonPrimary>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
