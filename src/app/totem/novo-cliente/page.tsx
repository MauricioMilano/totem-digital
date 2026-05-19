"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Suspense } from "react";
import { setCliente, setCustomerStatus } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { formatCPF, formatPhone } from "@/lib/totem-utils";

function NovoClienteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cpfFromUrl = searchParams.get("cpf") || "";
  const { clearTotemSession } = useTotemSession();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGuestClick() {
    setCustomerStatus("GUEST");
    router.push("/totem/servicos");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cpfFromUrl,
          telefone: telefone.replace(/\D/g, ""),
          email: email || undefined,
        }),
      });

      if (!res.ok) throw new Error();

      const cliente = await res.json();
      setCliente(cliente.id, cliente.nome, cliente.cpf);

      toast.success("Cadastro realizado!");
      router.push("/totem/servicos");
    } catch {
      toast.error("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/totem")}
          className="flex items-center gap-2 text-body-md text-body hover:text-ink mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-soft mb-4">
            <UserPlus className="w-6 h-6 text-ink" />
          </div>
          <h1 className="text-display-md text-ink mb-1">Novo Cliente</h1>
          <p className="text-body-md text-body">
            CPF: {formatCPF(cpfFromUrl)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Nome completo"
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
          <TextInput
            label="Email (opcional)"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

           <div className="flex gap-3 pt-2">
             <ButtonSecondary
                type="button"
                onClick={() => {
                  clearTotemSession();
                  router.push("/totem");
                }}
                className="flex-1"
              >
                Cancelar
             </ButtonSecondary>
             <ButtonPrimary type="submit" disabled={loading} className="flex-1">
               {loading ? "Salvando..." : "Confirmar"}
             </ButtonPrimary>
           </div>

           <div className="mt-6 text-center">
             <span className="text-body-sm text-body mr-2">Não quer se cadastrar?</span>
             <ButtonSecondary 
               onClick={handleGuestClick} 
               className="underline decoration-brand-primary underline-offset-4 p-0 h-auto bg-transparent border-none text-brand-primary hover:bg-transparent"
             >
               Continuar como Convidado
             </ButtonSecondary>
           </div>
         </form>
       </div>
    </div>
  );
}

export default function NovoClientePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <NovoClienteForm />
    </Suspense>
  );
}
