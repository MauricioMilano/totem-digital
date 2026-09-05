/**
 * Handlers de webhook Trinks (eventos do SNS).
 *
 * Esta camada é **pura** — recebe o payload já decodificado (JSON.parse'd) e
 * grava no banco local. NÃO chama a API Trinks, portanto a trava
 * TRINKS_DRY_RUN de trinks-client.ts NÃO se aplica aqui.
 *
 * O endpoint que roteia os eventos é a COMADIG-16 (/api/webhooks/trinks).
 * Esta task (COMADIG-15) entrega apenas o handler como função invocável
 * isoladamente para testes/mocks.
 */

import { prisma } from "./prisma";
import { resolveItemPrices } from "./comandas-utils";
import { formatCPF } from "./totem-utils";
import type { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Tipos do payload (evento TipoDeEvento 11 — Inclusão de Agendamento)
// Referência: docs/trinks-integration.md §3.1
// ---------------------------------------------------------------------------

export interface TrinksTelefoneItem {
  DDD?: string | null;
  Numero?: string | null;
}

export interface AgendamentoInclusaoPayload {
  IdDoAgendamento: number;
  CpfDoCliente?: string | null;
  NomeDoCliente?: string | null;
  EmailDoCliente?: string | null;
  TelefoneDoCliente?: TrinksTelefoneItem[] | null;
  NomeDoServicoNoEstabelecimento?: string | null;
  PrecoDoServicoNoAgendamento?: string | null;
  DuracaoDoAgendamento?: number | null;
  DataHoraInicioDoAgendamento: string;
  DataHoraFimDoAgendamento: string;
  Status?: string | null;
  Origem?: string | null;
  IdDoClienteNoEstabelecimento?: number | null;
  IdDoProfissional?: number | null;
}

/** Resultado retornado pelo handler. */
export interface HandleInclusaoResult {
  /** ID local do espelho AgendamentoTrinks. */
  agendamentoId: string;
  /** ID da comanda criada (ou existente em caso de reenvio). */
  comandaId: string;
  /** ID local do Cliente. */
  clienteId: string;
  /** true se a comanda foi criada agora; false se já existia (idempotência). */
  comandaCriada: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extrai apenas dígitos de um CPF (remove pontos, traço, espaços). */
function cpfDigits(cpf: string | null | undefined): string {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "").slice(0, 11);
}

/** Formata o telefone do payload para armazenamento local (apenas dígitos). */
function formatTelefone(tel: TrinksTelefoneItem[] | null | undefined): string | null {
  if (!tel || tel.length === 0) return null;
  const ddd = (tel[0].DDD ?? "").replace(/\D/g, "");
  const numero = (tel[0].Numero ?? "").replace(/\D/g, "");
  const full = ddd + numero;
  return full.length > 0 ? full : null;
}

/**
 * Busca match exato de nome no catálogo local (Servico → Bebida → Produto).
 * Retorna os IDs correspondentes para vincular o item da comanda.
 */
async function findCatalogMatch(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  nomeItem: string
): Promise<{ servicoId?: string; bebidaId?: string; produtoId?: string }> {
  const servico = await tx.servico.findFirst({
    where: { nome: nomeItem, ativo: true },
    select: { id: true },
  });
  if (servico) return { servicoId: servico.id };

  const bebida = await tx.bebida.findFirst({
    where: { nome: nomeItem, ativo: true },
    select: { id: true },
  });
  if (bebida) return { bebidaId: bebida.id };

  const produto = await tx.produto.findFirst({
    where: { nome: nomeItem, ativo: true },
    select: { id: true },
  });
  if (produto) return { produtoId: produto.id };

  return {};
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

/**
 * Handler do evento TipoDeEvento 11 (Inclusão de Agendamento).
 *
 * Fluxo:
 * 1. Upsert Cliente local por CPF (busca por dígitos puros E mascarados).
 * 2. Upsert espelho AgendamentoTrinks idempotente por `trinksId`.
 * 3. Abrir Comanda ABERTA com 1 ItemComanda (item solto, sem FK a menos que
 *    haja match exato de nome no catálogo local).
 * 4. Associar comandaId no espelho (1:1) dentro da mesma transação.
 *
 * Idempotência: reenvio do mesmo `IdDoAgendamento` atualiza o espelho e NUNCA
 * duplica a comanda.
 *
 * @param payload — payload decodificado do evento 11 (JSON.parse do SNS Message).
 * @returns Resultado com IDs criados/atualizados.
 */
export async function handleAgendamentoInclusao(
  payload: AgendamentoInclusaoPayload
): Promise<HandleInclusaoResult> {
  const trinksId = payload.IdDoAgendamento;
  const digits11 = cpfDigits(payload.CpfDoCliente);
  const nomeItem = payload.NomeDoServicoNoEstabelecimento ?? "Serviço Trinks";
  const precoUnit = parseFloat(payload.PrecoDoServicoNoAgendamento ?? "0") || 0;
  const dataInicio = new Date(payload.DataHoraInicioDoAgendamento);
  const dataFim = new Date(payload.DataHoraFimDoAgendamento);

  // Campos do espelho derivados do payload (reaproveitados no upsert).
  const espelhoData = {
    clienteCpf: digits11.length === 11 ? digits11 : null,
    clienteNome: payload.NomeDoCliente ?? null,
    clienteTrinksId: payload.IdDoClienteNoEstabelecimento ?? null,
    profissionalId: payload.IdDoProfissional ?? null,
    servicoNome: nomeItem,
    precoServico: precoUnit,
    duracaoMin: payload.DuracaoDoAgendamento ?? null,
    dataInicio,
    dataFim,
    status: payload.Status ?? "Confirmado",
    origem: payload.Origem ?? null,
  };

  // Tudo em UMA transação: Cliente + espelho + comanda atômicos. Se qualquer
  // passo falhar, nada persiste — e o reenvio do evento recomeça limpo.
  return prisma.$transaction(async (tx) => {
    // --- 1. Upsert Cliente local -----------------------------------------
    let cliente;
    if (digits11.length === 11) {
      // Busca pelas duas formas canônicas: dígitos puros ("11111111111") e
      // mascarada ("111.111.111-11", via formatCPF do totem). `contains` não
      // casa registros mascarados porque pontos/traço quebram a sequência de
      // 11 dígitos contíguos — critério 4 da COMADIG-15. A normalização dos
      // legados para dígitos puros segue na COMADIG-22 (sync), mas o handler
      // já casa os dois formatos sem criar duplicata.
      const existing = await tx.cliente.findFirst({
        where: { cpf: { in: [digits11, formatCPF(digits11)] } },
      });
      cliente =
        existing ??
        (await tx.cliente.create({
          data: {
            nome: payload.NomeDoCliente ?? "Cliente Trinks",
            cpf: digits11, // grava em 11 dígitos puros
            email: payload.EmailDoCliente ?? null,
            telefone: formatTelefone(payload.TelefoneDoCliente),
          },
        }));
    } else {
      // Sem CPF válido — usa fallback sintético baseado no IdDoClienteNoEstabelecimento
      const fallbackCpf = `trinks-${payload.IdDoClienteNoEstabelecimento ?? trinksId}`;
      const existing = await tx.cliente.findFirst({
        where: { cpf: fallbackCpf },
      });
      cliente =
        existing ??
        (await tx.cliente.create({
          data: {
            nome: payload.NomeDoCliente ?? "Cliente Trinks",
            cpf: fallbackCpf,
            email: payload.EmailDoCliente ?? null,
            telefone: formatTelefone(payload.TelefoneDoCliente),
          },
        }));
    }

    // --- 2. Upsert espelho idempotente por trinksId -----------------------
    const espelho = await tx.agendamentoTrinks.upsert({
      where: { trinksId },
      create: { trinksId, ...espelhoData },
      update: espelhoData,
    });

    // Idempotência: se o espelho já tem comandaId, só atualiza e não duplica.
    if (espelho.comandaId) {
      return {
        agendamentoId: espelho.id,
        comandaId: espelho.comandaId,
        clienteId: cliente.id,
        comandaCriada: false,
      };
    }

    // --- 3. Abrir Comanda ABERTA com 1 item (solto) ------------------------
    const catalogMatch = await findCatalogMatch(tx, nomeItem);
    const resolvedItens = await resolveItemPrices(tx, [
      {
        nomeItem,
        precoUnit,
        quantidade: 1,
        servicoId: catalogMatch.servicoId ?? null,
        bebidaId: catalogMatch.bebidaId ?? null,
        produtoId: catalogMatch.produtoId ?? null,
      },
    ]);
    const total = resolvedItens.reduce((acc, item) => acc + item.total, 0);

    const comanda = await tx.comanda.create({
      data: {
        clienteId: cliente.id,
        codigoRecibo: null, // Cliente identificado — sem código de recibo
        status: "ABERTA",
        total,
        itens: {
          create: resolvedItens.map((item) => ({
            nomeItem: item.nomeItem,
            precoUnit: item.precoUnit,
            quantidade: item.quantidade,
            total: item.total,
            servicoId: item.servicoId ?? null,
            bebidaId: item.bebidaId ?? null,
            produtoId: item.produtoId ?? null,
          })),
        },
      },
    });

    // --- 4. Associar comandaId no espelho (1:1) ----------------------------
    await tx.agendamentoTrinks.update({
      where: { id: espelho.id },
      data: { comandaId: comanda.id },
    });

    return {
      agendamentoId: espelho.id,
      comandaId: comanda.id,
      clienteId: cliente.id,
      comandaCriada: true,
    };
  });
}
