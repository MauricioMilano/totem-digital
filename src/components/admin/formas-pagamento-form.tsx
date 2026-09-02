"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ButtonPrimary } from "@/components/shared/button-primary";
import { ButtonSecondary } from "@/components/shared/button-secondary";
import { TextInput } from "@/components/shared/text-input";
import { useEffect } from "react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  permiteParcelamento: z.boolean(),
  maximoParcelas: z.string(),
});

export type FormaPagamentoFormData = z.infer<typeof formSchema>;

interface FormaPagamento {
  id: string;
  nome: string;
  descricao: string | null;
  permiteParcelamento: boolean;
  maximoParcelas: number;
  ativo: boolean;
}

interface FormasPagamentoFormProps {
  editingForma?: FormaPagamento | null;
  onSubmit: (data: FormaPagamentoFormData) => void;
  onCancel: () => void;
}

const opcoesParcelas = [1, 2, 3, 4, 6, 8, 10, 12];

export function FormasPagamentoForm({
  editingForma,
  onSubmit,
  onCancel,
}: FormasPagamentoFormProps) {
  const form = useForm<FormaPagamentoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      permiteParcelamento: false,
      maximoParcelas: "1",
    },
  });

  const permiteParcelamento = form.watch("permiteParcelamento");

  useEffect(() => {
    if (editingForma) {
      form.reset({
        nome: editingForma.nome,
        descricao: editingForma.descricao || "",
        permiteParcelamento: editingForma.permiteParcelamento,
        maximoParcelas: String(editingForma.maximoParcelas),
      });
    }
  }, [editingForma, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <TextInput
        label="Nome"
        placeholder="Ex: Cartão de Crédito"
        {...form.register("nome")}
        error={form.formState.errors.nome?.message}
      />

      <TextInput
        label="Descrição (opcional)"
        placeholder="Ex: Parcelamos em até 12x"
        {...form.register("descricao")}
      />

      <div className="flex flex-col gap-3">
        <label className="text-caption text-body">Máximo de Parcelas</label>
        <div className="flex flex-wrap gap-2">
          {opcoesParcelas.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                form.setValue("maximoParcelas", String(num));
                if (num > 1) {
                  form.setValue("permiteParcelamento", true);
                }
              }}
              className={`px-3 py-2 rounded-pill text-body-md border transition-colors ${
                form.watch("maximoParcelas") === String(num)
                  ? "bg-brand-primary text-on-primary border-brand-primary"
                  : "bg-canvas text-ink border-hairline hover:border-border-strong"
              }`}
            >
              {num === 1 ? "À vista" : `${num}x`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="permiteParcelamento"
          {...form.register("permiteParcelamento")}
          className="w-4 h-4 rounded border-hairline"
        />
        <label htmlFor="permiteParcelamento" className="text-body-md text-body">
          Permite parcelamento
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <ButtonPrimary type="submit">
          {editingForma ? "Salvar" : "Criar"}
        </ButtonPrimary>
        <ButtonSecondary type="button" onClick={onCancel}>
          Cancelar
        </ButtonSecondary>
      </div>
    </form>
  );
}
