/**
 * Sonda COMADIG-15 — edge cases além dos critérios de aceite.
 * Cada sonda termina com limpeza própria; nada persiste no final.
 */
import { prisma } from "../src/lib/prisma";
import { handleAgendamentoInclusao, type AgendamentoInclusaoPayload } from "../src/lib/trinks-webhooks";

const TRINKS_ID = 765432109; // faixa isolada do script principal
let failures = 0;
function check(label: string, ok: boolean, extra?: unknown) {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ""}`);
  if (!ok) failures++;
}

async function cleanup() {
  const espelhos = await prisma.agendamentoTrinks.findMany({ where: { trinksId: { gte: TRINKS_ID } } });
  const clientes = await prisma.cliente.findMany({ where: { cpf: { startsWith: "trinks-" } } });
  const comandas = await prisma.comanda.findMany({
    where: { OR: [{ id: { in: espelhos.map((e) => e.comandaId).filter((v): v is string => !!v) } }, { clienteId: { in: clientes.map((c) => c.id) } }] },
  });
  if (comandas.length > 0) {
    await prisma.itemComanda.deleteMany({ where: { comandaId: { in: comandas.map((c) => c.id) } } });
    await prisma.agendamentoTrinks.deleteMany({ where: { trinksId: { gte: TRINKS_ID } } });
    await prisma.comanda.deleteMany({ where: { id: { in: comandas.map((c) => c.id) } } });
  }
  if (clientes.length > 0) await prisma.cliente.deleteMany({ where: { id: { in: clientes.map((c) => c.id) } } });
}

function payload(n: number, over: Partial<AgendamentoInclusaoPayload> = {}): AgendamentoInclusaoPayload {
  return {
    IdDoAgendamento: TRINKS_ID + n,
    CpfDoCliente: null,
    NomeDoCliente: `Sonda ${n}`,
    EmailDoCliente: null,
    TelefoneDoCliente: null,
    NomeDoServicoNoEstabelecimento: "Serviço Sonda",
    PrecoDoServicoNoAgendamento: "50.00",
    DuracaoDoAgendamento: 30,
    DataHoraInicioDoAgendamento: "2026-10-01T10:00:00Z",
    DataHoraFimDoAgendamento: "2026-10-01T10:30:00Z",
    Status: "Confirmado",
    Origem: "API",
    IdDoClienteNoEstabelecimento: 9000 + n,
    ...over,
  };
}

async function main() {
  await cleanup();

  // S1 — Sem CPF: fallback sintético cria cliente único por IdDoCliente
  const s1 = await handleAgendamentoInclusao(payload(1));
  const c1 = await prisma.cliente.findUnique({ where: { id: s1.clienteId } });
  check("S1: sem CPF → cliente com fallback trinks-<id>", c1?.cpf === "trinks-9001", c1?.cpf);

  // S2 — Dois agendamentos SEM CPF, IdDoCliente diferentes → clientes distintos (sem mesclagem)
  const s2 = await handleAgendamentoInclusao(payload(2));
  check("S2: mesmo fallback para clientes distintos não mescla", s2.clienteId !== s1.clienteId, { a: s1.clienteId, b: s2.clienteId });

  // S3 — Match exato no catálogo local: item deve vincular FK e usar preço do catálogo
  const servico = await prisma.servico.findFirst({ where: { ativo: true } });
  if (servico) {
    const s3 = await handleAgendamentoInclusao(payload(3, { NomeDoServicoNoEstabelecimento: servico.nome, PrecoDoServicoNoAgendamento: "999.99" }));
    const comanda = await prisma.comanda.findUnique({ where: { id: s3.comandaId }, include: { itens: true } });
    const it = comanda?.itens[0];
    check("S3: item vincula servicoId do catálogo", it?.servicoId === servico.id, { esperado: servico.id, obtido: it?.servicoId });
    check(
      "S3: preço vem do catálogo local (não do payload)",
      it ? Number(it.precoUnit) === Number(servico.preco) : false,
      { catalogo: Number(servico.preco), payload: 999.99, obtido: it ? Number(it.precoUnit) : null }
    );
  } else {
    check("S3: catálogo de serviços vazio — pulando", false);
  }

  // S4 — Nome inexistente no catálogo → item solto (sem FK), preço do payload
  const s4 = await handleAgendamentoInclusao(payload(4, { NomeDoServicoNoEstabelecimento: "Serviço Que Não Existe XYZ" }));
    const comanda4 = await prisma.comanda.findUnique({ where: { id: s4.comandaId }, include: { itens: true } });
    const it4 = comanda4?.itens[0];
  check("S4: item solto sem FK quando não há match", !it4?.servicoId && !it4?.bebidaId && !it4?.produtoId);
  check("S4: preço do payload preservado quando solto", it4 ? Number(it4.precoUnit) === 50 : false);

  // S5 — Evidência C1 na tela real: comanda ABERTA visível em GET /api/comandas?status=ABERTA
  const resp = await fetch("http://localhost:3000/api/comandas?status=ABERTA");
  const ok = resp.status === 200;
  if (ok) {
    const comandas: any[] = await resp.json();
    const achou = comandas.find((c) => c.id === s1.comandaId);
    check("S5: GET /api/comandas?status=ABERTA expõe a comanda do handler", Boolean(achou), { total: comandas.length });
  } else {
    check(`S5: dev server respondeu ${resp.status}`, false);
  }

  // S6 — Payload sem nome de serviço → item não quebra (fallback "Serviço Trinks")
  const s6 = await handleAgendamentoInclusao(payload(6, { NomeDoServicoNoEstabelecimento: null }));
  const comanda6 = await prisma.comanda.findUnique({ where: { id: s6.comandaId }, include: { itens: true } });
  check("S6: nome nulo → fallback 'Serviço Trinks'", comanda6?.itens[0]?.nomeItem === "Serviço Trinks", comanda6?.itens[0]?.nomeItem);

  await cleanup();
  console.log(failures === 0 ? "\nSONDAS: TODAS PASSARAM" : `\nSONDAS: ${failures} FALHA(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error("ERRO:", e);
    process.exit(2);
  })
  .finally(() => prisma.$disconnect());
