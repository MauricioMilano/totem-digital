"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { Plus } from "lucide-react";
import { FormasPagamentoTable } from "@/components/admin/formas-pagamento-table";
import { FormasPagamentoForm, FormaPagamentoFormData } from "@/components/admin/formas-pagamento-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormaPagamento {
  id: string;
  nome: string;
  descricao: string | null;
  permiteParcelamento: boolean;
  maximoParcelas: number;
  ativo: boolean;
}

export default function FormasPagamentoPage() {
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingForma, setEditingForma] = useState<FormaPagamento | null>(null);

  async function loadFormas() {
    try {
      const res = await fetch("/api/formas-pagamento?todas=true");
      const data = await res.json();
      setFormas(data);
    } catch {
      toast.error("Erro ao carregar formas de pagamento");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFormas(); }, []);

  async function handleSubmit(data: FormaPagamentoFormData) {
    try {
      const url = editingForma
        ? `/api/formas-pagamento/${editingForma.id}`
        : "/api/formas-pagamento";
      const method = editingForma ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success(editingForma ? "Forma de pagamento atualizada" : "Forma de pagamento criada");
      setShowModal(false);
      setEditingForma(null);
      loadFormas();
    } catch {
      toast.error("Erro ao salvar forma de pagamento");
    }
  }

  async function handleToggleActive(id: string, ativo: boolean) {
    try {
      const res = await fetch(`/api/formas-pagamento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo }),
      });
      if (!res.ok) throw new Error();
      toast.success(ativo ? "Forma ativada" : "Forma desativada");
      loadFormas();
    } catch {
      toast.error("Erro ao alterar status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Desativar esta forma de pagamento?")) return;
    try {
      await fetch(`/api/formas-pagamento/${id}`, { method: "DELETE" });
      toast.success("Forma de pagamento desativada");
      loadFormas();
    } catch {
      toast.error("Erro ao desativar");
    }
  }

  function handleEdit(forma: FormaPagamento) {
    setEditingForma(forma);
    setShowModal(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-md text-ink">Formas de Pagamento</h1>
          <p className="text-body-md text-body mt-1">
            Gerencie as formas de pagamento disponíveis no totem
          </p>
        </div>
        <ButtonPrimary
          onClick={() => {
            setEditingForma(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Nova Forma
        </ButtonPrimary>
      </div>

      {loading ? (
        <div className="text-body-md text-muted">Carregando...</div>
      ) : (
        <FormasPagamentoTable
          formas={formas}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-title-md text-ink">
              {editingForma ? "Editar" : "Nova"} Forma de Pagamento
            </DialogTitle>
          </DialogHeader>
          <FormasPagamentoForm
            editingForma={editingForma}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowModal(false);
              setEditingForma(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
