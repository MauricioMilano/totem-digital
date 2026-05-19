"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { Scissors, ShoppingBag } from "lucide-react";
import { setCustomerStatus, setCliente } from "@/hooks/use-comanda";

export default function TotemPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasActiveComanda, setHasActiveComanda] = useState(false);

  useEffect(() => {
    async function checkActiveComanda() {
      const clienteId = sessionStorage.getItem("totem-cliente");
      if (clienteId && clienteId !== "guest") {
        try {
          const res = await fetch(`/api/comandas/totem/${clienteId}`);
          if (res.ok) {
            setHasActiveComanda(true);
          }
        } catch (e) {
          console.error("Error checking active comanda", e);
        }
      }
    }
    checkActiveComanda();
  }, []);

  function formatCPF(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  async function handleGuestClick() {
    setCustomerStatus("GUEST");
    router.push("/totem/servicos");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      setError("CPF deve ter 11 dígitos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/clientes/${cpfDigits}`);
      if (res.status === 404) {
        // Novo cliente - redirecionar para cadastro
        router.push(`/totem/novo-cliente?cpf=${cpfDigits}`);
        return;
      }

      if (!res.ok) throw new Error();

      const cliente = await res.json();
      // Salvar cliente na sessão via hook de estado global
      setCliente(cliente.id, cliente.nome, cliente.cpf);

      router.push("/totem/servicos");
    } catch {
      setError("Erro ao buscar CPF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary mb-6">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-display-lg text-ink mb-2">Barbearia</h1>
          <p className="text-body-md text-body max-w-sm mx-auto">
            Informe seu CPF para iniciar seu atendimento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextInput
            label="CPF"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            error={error}
            maxLength={14}
            autoFocus
          />

          <ButtonPrimary type="submit" disabled={loading} className="w-full">
            {loading ? "Buscando..." : "Continuar"}
          </ButtonPrimary>
        </form>

        <div className="mt-6 text-center">
          <span className="text-body-sm text-body mr-2">Já possui CPF?</span>
          <ButtonSecondary onClick={handleGuestClick} className="underline decoration-brand-primary underline-offset-4 p-0 h-auto bg-transparent border-none text-brand-primary hover:bg-transparent" >
            Continuar como Convidado
          </ButtonSecondary>
        </div>

        {hasActiveComanda && (
          <div className="mt-8 pt-6 border-t border-hairline">
            <ButtonPrimary 
              onClick={() => router.push("/totem/minha-comanda")} 
              className="w-full flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Consultar Minha Comanda
            </ButtonPrimary>
          </div>
        )}
      </div>
    </div>
  );
}
