"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { ArrowLeft, Search, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { setCliente } from "@/hooks/use-comanda";

interface ComandaAtiva {
  id: string;
  total: number;
  createdAt: string;
  cliente: {
    id: string;
    nome: string;
    cpf: string;
  } | null;
}

export default function ComandasAtivasPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [comandas, setComandas] = useState<ComandaAtiva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComandas() {
      try {
        // This endpoint will be created in the next tasks
        const res = await fetch("/api/comandas/totem/ativas");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setComandas(data);
      } catch (err) {
        console.error("Erro ao carregar comandas:", err);
        // toast.error("Não foi possível carregar as comandas ativas.");
      } finally {
        setLoading(false);
      }
    }
    fetchComandas();
  }, []);

  const filteredComandas = comandas.filter((c) => {
    const nome = c.cliente?.nome?.toLowerCase() || "convidado";
    return nome.includes(search.toLowerCase());
  });

  function handleSelectComanda(comanda: ComandaAtiva) {
    if (comanda.cliente) {
      setCliente(comanda.cliente.id, comanda.cliente.nome, comanda.cliente.cpf);
    }
    router.push("/totem/minha-comanda");
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Header */}
      <div className="px-6 py-6 border-b border-hairline bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/totem")}
            className="flex items-center gap-2 text-body-md text-body hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-title-md font-cal text-ink">Comandas Ativas</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="mb-10">
          <TextInput
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-lg py-6"
            // icon={<Search className="w-5 h-5 text-muted" />} // Assuming TextInput supports icons, but checking current implementation...
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-body-md text-muted-foreground">Carregando comandas...</div>
        ) : filteredComandas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredComandas.map((comanda) => (
              <button
                key={comanda.id}
                onClick={() => handleSelectComanda(comanda)}
                className="flex flex-col p-6 bg-surface-soft border border-hairline rounded-lg hover:border-brand-primary text-left transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div className="text-right">
                    <p className="text-caption text-body flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {new Date(comanda.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <h3 className="text-title-sm font-cal text-ink mb-1">
                  {comanda.cliente?.nome || "Convidado"}
                </h3>
                <p className="text-body-md text-brand-primary font-bold">
                  R$ {Number(comanda.total).toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-body-md text-body">Nenhuma comanda ativa encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
