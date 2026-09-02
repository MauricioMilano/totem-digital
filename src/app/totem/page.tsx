"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { Scissors, ShoppingBag, PlusCircle, Search, ArrowLeft, AlertCircle } from "lucide-react";
import { setCliente } from "@/hooks/use-comanda";
import { useTotemSession } from "@/hooks/use-totem-session";
import { formatCPF } from "@/lib/totem-utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { GuestForm } from "@/components/totem/guest-form";

export default function TotemPage() {
  const router = useRouter();
  const [step, setStep] = useState<"selection" | "identification" | "guest">("selection");
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasActiveComanda, setHasActiveComanda] = useState(false);
  const [activeComandaData, setActiveComandaData] = useState<any>(null);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const { getCliente } = useTotemSession();

  useEffect(() => {
    async function checkActiveComanda() {
      const clienteId = getCliente();
      if (clienteId && clienteId !== "guest") {
        try {
          const res = await fetch(`/api/comandas/totem/${clienteId}`);
          if (res.ok) {
            const data = await res.json();
            setHasActiveComanda(true);
            setActiveComandaData(data);
          }
        } catch (e) {
          console.error("Error checking active comanda", e);
        }
      }
    }
    checkActiveComanda();
  }, []);

  function handleGuestClick() {
    setStep("guest");
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
        router.push(`/totem/novo-cliente?cpf=${cpfDigits}`);
        return;
      }

      if (!res.ok) throw new Error();

      const cliente = await res.json();
      
      // Check for active comanda for THIS specific CPF entered
      const comandaRes = await fetch(`/api/comandas/totem/${cliente.id}`);
      if (comandaRes.ok) {
        const comandaData = await comandaRes.json();
        setCliente(cliente.id, cliente.nome, cliente.cpf);
        setActiveComandaData(comandaData);
        setShowMergeModal(true);
        setLoading(false);
        return;
      }

      setCliente(cliente.id, cliente.nome, cliente.cpf);
      router.push("/totem/servicos");
    } catch {
      setError("Erro ao buscar CPF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleContinueWithExisting() {
    setShowMergeModal(false);
    router.push("/totem/servicos");
  }

  function handleViewExisting() {
    setShowMergeModal(false);
    router.push("/totem/minha-comanda");
  }

  if (step === "guest") {
    return (
      <GuestForm
        onBack={() => setStep("identification")}
        onCancel={() => router.push("/totem")}
      />
    );
  }

  if (step === "selection") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-canvas">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary mb-6">
              <Scissors className="w-10 h-10 text-on-primary" />
            </div>
            <h1 className="text-display-lg font-cal text-ink mb-4">Bem-vindo à Barbearia</h1>
            <p className="text-title-md text-body max-w-lg mx-auto">
              Escolha como deseja prosseguir com seu atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Abrir Comanda Card */}
            <button
              onClick={() => setStep("identification")}
              className="flex flex-col items-center p-12 bg-surface-card border border-hairline rounded-lg hover:border-brand-primary hover:shadow-lg transition-all group"
            >
              <div className="w-20 h-20 rounded-full bg-brand-primary text-on-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-10 h-10" />
              </div>
              <h2 className="text-display-sm font-cal text-ink mb-3 tracking-tight">Novo Pedido</h2>
              <p className="text-body-md text-body max-w-[200px]">
                Inicie um novo atendimento e escolha seus serviços
              </p>
            </button>

            {/* Ver Comandas Card */}
            <button
              onClick={() => router.push("/totem/comandas")}
              className="flex flex-col items-center p-12 bg-surface-card border border-hairline rounded-lg hover:border-brand-primary hover:shadow-lg transition-all group"
            >
              <div className="w-20 h-20 rounded-full bg-brand-primary text-on-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Search className="w-10 h-10" />
              </div>
              <h2 className="text-display-sm font-cal text-ink mb-3 tracking-tight">Minha Conta</h2>
              <p className="text-body-md text-body max-w-[200px]">
                Consulte seu consumo ou finalize o pagamento
              </p>
            </button>
          </div>

          {hasActiveComanda && (
            <div className="mt-12">
              <ButtonSecondary 
                onClick={() => router.push("/totem/minha-comanda")} 
                className="flex items-center justify-center gap-2 mx-auto"
              >
                <ShoppingBag className="w-5 h-5" />
                Continuar com minha comanda aberta
              </ButtonSecondary>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-canvas">
      <div className="w-full max-w-md text-center">
        <button 
          onClick={() => setStep("selection")}
          className="mb-8 flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </button>

        <div className="mb-12">
          <h1 className="text-display-md font-cal text-ink mb-2">Identificação</h1>
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
          <span className="text-body-sm text-body mr-2">Não quer informar o CPF?</span>
          <ButtonSecondary onClick={handleGuestClick} className="underline decoration-brand-primary underline-offset-4 p-0 h-auto bg-transparent border-none text-brand-primary hover:bg-transparent" >
            Continuar como Convidado
          </ButtonSecondary>
        </div>

        {/* Merge Choice Modal */}
        <Dialog open={showMergeModal} onOpenChange={setShowMergeModal}>
          <DialogContent className="sm:max-w-md bg-canvas border-hairline">
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-brand-primary" />
              </div>
              <DialogTitle className="text-display-sm font-cal text-ink">Conta em Aberto!</DialogTitle>
              <DialogDescription className="text-body-md text-body pt-2">
                Olá, <span className="font-bold text-ink">{activeComandaData?.cliente?.nome}</span>! Identificamos que você já possui uma comanda aberta conosco. O que deseja fazer?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col gap-3 sm:flex-col sm:justify-center mt-6">
              <ButtonPrimary onClick={handleContinueWithExisting} className="w-full py-6 text-lg">
                Adicionar Itens à Conta Existente
              </ButtonPrimary>
              <ButtonSecondary onClick={handleViewExisting} className="w-full py-4">
                Apenas Ver meu Consumo
              </ButtonSecondary>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


