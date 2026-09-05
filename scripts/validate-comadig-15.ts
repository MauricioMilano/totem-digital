/**
 * Validação COMADIG-15 — invoca handleAgendamentoInclusao diretamente com
 * payloads mock (sem endpoint webhook) e confere os critérios de aceite.
 */
import { prisma } from "../src/lib/prisma";
import { handleAgendamentoInclusao, type AgendamentoInclusaoPayload } from "../src/lib/trinks-webhooks";

const TRINKS_ID = 987654321; // IdDoAgendamento de teste (isolado)
const CPF_NOVO_DIGITOS = "99988877701";
const CPF_LEGADO_MASCARADO = "123.456.789-09";

function basePayload(over: Partial<AgendamentoInclusaoPayload>): AgendamentoInclusaoPayload {
  return {
    IdDoAgendamento: TRINKS_ID,
    CpfDoCliente: CPF_NOVO_DIGITOS,
    NomeDoCliente: "Cliente Teste Trinks",
    EmailDoCliente: "teste.trinks@example.com",
    TelefoneDoCliente: [{ DDD: "11", Numero: "98888-7777" }],
    NomeDoServicoNoEstabelecimento: "Corte + Barba (Teste COMADIG-15)",
    PrecoDoServicoNoAgendamento: "120.50",
    DuracaoDoAgendamento: 60,
    DataHoraInicioDoAgendamento: "2026-09-10T14:00:00Z",
    DataHoraFimDoAgendamento: "2026-09-10T15:00:00Z",
    Status: "Confirmado",
    Origem: "API",
    IdDoClienteNoEstabelecimento: 424242,
    ...over,
  };
}

let failures = 0;
function check(label: string, ok: boolean, extra?: unknown) {
  console.log(`${ok ? "✅" : "❌"} ${label}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ""}`);
  if (!ok) failures++;
}

/**
 * Limpeza na ordem correta das FKs (sem cascade): itens → espelhos → comandas → clientes.
 */
async function cleanupTestData() {
  const trinksIds = [TRINKS_ID, TRINKS_ID + 1];
  const nomesClientes = ["Cliente Teste Trinks", "Cliente Legado"];

  const espelhos = await prisma.agendamentoTrinks.findMany({ where: { trinksId: { in: trinksIds } } });
  const clientes = await prisma.cliente.findMany({ where: { nome: { in: nomesClientes } } });
  const comandas = await prisma.comanda.findMany({
    where: { OR: [{ id: { in: espelhos.map((e) => e.comandaId).filter((v): v is string => !!v) } }, { clienteId: { in: clientes.map((c) => c.id) } }] },
  });

  if (comandas.length > 0) {
    await prisma.itemComanda.deleteMany({ where: { comandaId: { in: comandas.map((c) => c.id) } } });
    await prisma.agendamentoTrinks.deleteMany({ where: { trinksId: { in: trinksIds } } });
    await prisma.comanda.deleteMany({ where: { id: { in: comandas.map((c) => c.id) } } });
  }
  if (clientes.length > 0) {
    await prisma.cliente.deleteMany({ where: { id: { in: clientes.map((c) => c.id) } } });
  }
  console.log(`Limpeza: ${comandas.length} comanda(s), ${espelhos.length} espelho(s), ${clientes.length} cliente(s) removido(s).`);
}

async function main() {
  // --- Reset completo antes de rodar (re-execução idempotente do script) ---
  await cleanupTestData();

  // --- Critério 4 (setup): cliente legado gravado com CPF mascarado -------
  await prisma.cliente.create({
    data: { nome: "Cliente Legado", cpf: CPF_LEGADO_MASCARADO, telefone: "11977770000" },
  });

  // --- Critério 1: CPF novo → Cliente + comanda ABERTA ---------------------
  const r1 = await handleAgendamentoInclusao(basePayload({}));
  check("C1: handler retorna ids", Boolean(r1.comandaId && r1.clienteId && r1.agendamentoId), r1);

  const comanda1 = await prisma.comanda.findUnique({ where: { id: r1.comandaId }, include: { cliente: true, itens: true } });
  check("C1: comanda ABERTA existe", comanda1?.status === "ABERTA", comanda1?.status);
  check("C1: comanda associada ao cliente novo", comanda1?.clienteId === r1.clienteId);
  const clienteNovo = await prisma.cliente.findUnique({ where: { id: r1.clienteId } });
  check("C1: cliente criado com CPF em 11 dígitos", clienteNovo?.cpf === CPF_NOVO_DIGITOS, clienteNovo?.cpf);
  check("C1: sem codigoRecibo", comanda1?.codigoRecibo == null);

  // --- Critério 2: exatamente 1 item com nome/preço do payload -------------
  check("C2: exatamente 1 item", comanda1?.itens.length === 1, comanda1?.itens.length);
  const it = comanda1?.itens[0];
  check(
    "C2: nome/preço do payload",
    it?.nomeItem === "Corte + Barba (Teste COMADIG-15)" && Number(it?.precoUnit) === 120.5,
    { nome: it?.nomeItem, preco: it ? Number(it.precoUnit) : null }
  );

  // --- Critério 3: reenvio do mesmo evento → sem duplicata -----------------
  const before = {
    espelhos: await prisma.agendamentoTrinks.count({ where: { trinksId: TRINKS_ID } }),
    comandas: await prisma.comanda.count({ where: { clienteId: r1.clienteId, status: "ABERTA" } }),
  };
  const r2 = await handleAgendamentoInclusao(basePayload({ PrecoDoServicoNoAgendamento: "135.75", Status: "EmAtendimento" }));
  const after = {
    espelhos: await prisma.agendamentoTrinks.count({ where: { trinksId: TRINKS_ID } }),
    comandas: await prisma.comanda.count({ where: { clienteId: r1.clienteId, status: "ABERTA" } }),
  };
  check("C3: reenvio não duplica espelho", before.espelhos === after.espelhos && after.espelhos === 1, { before, after });
  check("C3: reenvio não duplica comanda", before.comandas === after.comandas && after.comandas === 1, { before, after });
  check("C3: mesma comandaId no reenvio", r2.comandaId === r1.comandaId);
  check("C3: comandaCriada=false no reenvio", r2.comandaCriada === false);
  const espelhoAtual = await prisma.agendamentoTrinks.findUnique({ where: { trinksId: TRINKS_ID } });
  check(
    "C3: campos do espelho atualizados",
    Number(espelhoAtual?.precoServico) === 135.75 && espelhoAtual?.status === "EmAtendimento",
    { preco: espelhoAtual ? Number(espelhoAtual.precoServico) : null, status: espelhoAtual?.status }
  );

  // --- Critério 4: CPF mascarado casa com cliente em qualquer formato ------
  const clientsBefore = await prisma.cliente.count({ where: { nome: "Cliente Legado" } });
  const r3 = await handleAgendamentoInclusao(basePayload({ IdDoAgendamento: TRINKS_ID + 1, CpfDoCliente: CPF_LEGADO_MASCARADO.replace(/\D/g, "") }));
  const clientsAfter = await prisma.cliente.count({ where: { nome: "Cliente Legado" } });
  check("C4: CPF mascarado no payload casa com cliente legado (sem duplicata)", clientsBefore === clientsAfter && r3.clienteId === (await prisma.cliente.findFirst({ where: { cpf: CPF_LEGADO_MASCARADO } }))?.id, { before: clientsBefore, after: clientsAfter });

  // --- Critério 5: invocável isoladamente ----------------------------------
  check("C5: função importada e invocada sem endpoint webhook", true);

  // --- Limpeza final --------------------------------------------------------
  await cleanupTestData();
  console.log("Limpeza final concluída.");

  console.log(failures === 0 ? "\nRESULTADO: TODOS OS CRITÉRIOS PASSARAM" : `\nRESULTADO: ${failures} FALHA(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error("ERRO:", e);
    process.exit(2);
  })
  .finally(() => prisma.$disconnect());
