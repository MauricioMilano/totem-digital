# Inconsistências — Comanda Digital × Trinks (estado atual)

Análise do que o repositório tem **hoje** e onde isso conflita ou fica em branco frente ao modelo da Trinks. Base: `prisma/schema.prisma`, fluxo do totem (`src/app/totem/**`), APIs de comanda/cliente (`src/app/api/**`) e a API/webhooks da Trinks (ver `docs/trinks-integration.md`).

> Objetivo: listar cada divergência, o risco concreto e a decisão que falta. Usar como input para refinar as tasks do módulo.

---

## 1. Não existe conceito de "agendamento" no projeto

**Hoje:** a comanda é aberta **pelo cliente no totem**, quando ele escolhe serviços (`src/app/totem/page.tsx` → `/totem/servicos`). O gatilho de abertura é o ato de selecionar itens, não um agendamento.

**Trinks:** o agendamento é o centro do processo — cliente agenda **um serviço com um profissional em um horário**, e os eventos (inclusão/alteração/exclusão) giram em torno dele.

**Risco:** sem espelhar o agendamento localmente, não há "ponto de ancoragem" para associar a comanda nem para reagendar. É a divergência raiz — as tasks COMADIG-13 (tabela `AgendamentoTrinks`) e COMADIG-15/17/18 existem para cobrir isso.

---

## 2. Serviços locais ≠ serviços Trinks (sem mapeamento)

**Hoje:** `Servico` é CRUD local (`prisma/schema.prisma`, `src/app/api/servicos/**`) com `id cuid`, `preco`, `duracaoMin`. O totem precifica a partir desses IDs.

**Trinks:** cada agendamento traz `IdDoServicoNoEstabelecimento` + `NomeDoServicoNoEstabelecimento` + `PrecoDoServicoNoAgendamento`. Não há campo em `Servico` para guardar o ID Trinks.

**Risco:**
- O mesmo "Corte" pode custar R$40 no totem e R$50 na Trinks → a comanda pré-preenchida pelo agendamento desalinhada do que o cliente pagou/agendou.
- Ao reagendar (evento 12) mudando de serviço, não há como localizar o `Servico` local correspondente para atualizar o item da comanda — só o nome livre.

**Decisão pendente:** criar mapeamento `trinks_servico_id` em `Servico` (ou tabela-relação), ou sempre precificar a comanda pelo preço do agendamento (ignorar `Servico.preco`). **Recomendação:** adicionar `trinksId String? @unique` no `Servico` + fallback por nome.

---

## 3. Cliente local não guarda o ID Trinks; CPF é frágil como chave única

**Hoje:** `Cliente { id cuid, nome, cpf unique, telefone?, email? }`. Lookup por CPF em `/api/clientes/[cpf]`. Sem campo de ID externo.

**Trinks:** cliente identificado por `IdDoClienteNoEstabelecimento` (estável) **e** `CpfDoCliente`. O payload traz os dois.

**Riscos:**
- Usar só o CPF: se um cliente Trinks vier sem CPF (ou com CPF mascarado), a associação falha. A Trinks tem ID numérico estável que deveríamos persistir.
- **Formato do CPF:** o totem normaliza para 11 dígitos (`formatCPF` em `src/lib/totem-utils.ts`), mas o webhook pode vir com máscara. Sem normalização no handler, upsert por CPF duplica clientes.

**Decisão pendente:** adicionar `trinksClienteId Int? @unique` em `Cliente` e **sempre** normalizar CPF (só dígitos) antes do upsert.

---

## 4. Profissional: `Usuario` ≠ `IdDoProfissional`

**Hoje:** a comanda referencia `usuarioId` (o profissional que atende), que é um `Usuario` local (login admin).

**Trinks:** o agendamento traz `IdDoProfissional` / `IdDoProfissionalNoEstabelecimento`.

**Risco:** não há como atribuir à comanda o profissional **do agendamento**. Hoje quem "abre" a comanda no totem é o cliente; o `usuarioId` só entra se um admin agir. A ligação profissional↔comanda, que a Trinks fornece de graça, está sendo desperdiçada.

**Decisão pendente:** mapear `IdDoProfissionalNoEstabelecimento` → `Usuario` (campo `trinksId` em `Usuario`, ou guardar o ID Trinks na comanda/espelho).

---

## 5. Cardinalidade cliente ↔ comanda: múltiplas ABERTA vs 1 agendamento = 1 comanda

**Hoje:** um CPF pode ter **várias comandas ABERTA** ao mesmo tempo — o totem tem modal de merge (`showMergeModal`, `src/app/api/comandas/totem/merge/route.ts`) justamente para resolver isso. `getActiveComandaId` retorna a mais recente.

**Trinks:** um agendamento é uma unidade (1 serviço em 1 horário). O modelo proposto é **1 agendamento ↔ 1 comanda**.

**Risco:** quando o evento de inclusão cria a comanda do agendamento, e o cliente já tinha outra ABERTA no totem, surge ambiguidade: qual comanda o agendamento aponta? As duas ficam abertas. Risco de double billing / confusão na finalização.

**Decisão pendente (importante):** definir política —
- **(A)** Agendamento "adota" a comanda ABERTA existente do cliente (se houver) em vez de criar nova; ou
- **(B)** O agendamento sempre cria sua comanda dedicada e as outras continuam independentes.
Recomendo **(A)** quando a comanda aberta é do mesmo cliente e ainda não tem itens além do serviço — reduz duplicidade.

---

## 6. Ciclos de vida não mapeados (status)

| Comanda (`StatusComanda`) | Agendamento Trinks | Ponte sugerida |
|---|---|---|
| ABERTA | Confirmado / Pendente / **EmAtendimento** | abrir/manter comanda |
| PAGA | Finalizado | pagar → finalizar |
| CANCELADA | Cancelado / ClienteFaltou | cancelar comanda |

**Hoje:** a comanda não tem estado "em atendimento" nem "aguardando pagamento pós-serviço". Não há gatilho que feche a comanda quando o agendamento vira `Finalizado`.

**Risco:**
- Agendamento `EmAtendimento` (cliente chegou) → hoje nada abre a comanda; depende do cliente digitar no totem. Se a ideia é "abrir a comanda associada ao agendamento", faltam esses gatilhos.
- Agendamento `Finalizado` → a comanda fica ABERTA para sempre se ninguém pagar no totem.
- **Conflito com Reabrir:** `POST /api/comandas/[id]/reabrir` volta PAGA→ABERTA sem saber do agendamento. Se o agendamento já está Finalizado/Cancelado, reabrir a comanda dessincroniza (comanda aberta para um serviço que a Trinks considera encerrado).

**Decisão pendente:** definir tabela de transições e se `reabrir` deve verificar o status do agendamento associado.

---

## 7. Item de serviço na comanda é editável → pode divergir do agendado

**Hoje:** `ItemComanda` é livre: `quantidade`, `precoUnit` (que pode ser sobrescrito por admin via itens). O cliente escolhe quantidade no totem.

**Trinks:** o agendamento fixa **1 unidade** de um serviço com preço definido.

**Risco:** se pré-preenchemos o item do serviço, o cliente/admin pode zerar a quantidade ou mudar o preço → a comanda deixa de refletir o que foi agendado e pago na Trinks.

**Decisão pendente:** marcar o item "do agendamento" como **base não editável** (ou ao menos protegido contra qty=0), separando-o dos itens extras (bebidas/produtos) que são livres.

---

## 8. Convidados (GUEST) não têm correspondente na Trinks

**Hoje:** o totem suporta fluxo **GUEST** sem CPF (`customerStatus: "GUEST"` em `src/hooks/use-comanda.ts`), comanda vira `clienteId = null` + `codigoRecibo`.

**Trinks:** agendamento sempre tem cliente com CPF/ID. Não existe "agendamento de convidado".

**Risco:** a integração só cobre clientes identificados. Convidados ficam fora do fluxo de agendamento (o que é esperado), mas precisamos decidir: **convidado pode ter comanda associada a um agendamento?** (ex.: cliente agendou online, chega sem CPF no totem). Se sim, precisamos de outra chave (nome+telefone) — frágil.

**Decisão pendente:** escopo inicial = **só clientes com CPF**. Convidados seguem o fluxo atual, sem agendamento. Documentar como limite conhecido.

---

## 9. Fonte da verdade do pagamento: dois sistemas financeiros?

**Hoje:** a comanda tem pagamento próprio (`formaPagamentoId`, `quantidadeParcelas`, status PAGA). É o "caixa" do sistema.

**Trinks:** tem módulo financeiro próprio (lançamentos, transações, formas de pagamento — ver docs). 

**Risco:** se ambos registram o pagamento, temos dupla contabilização e risco de divergência (comanda PAGA mas lançamento Trinks em aberto, ou vice-versa).

**Decisão pendente (crítica):** definir quem é a fonte da verdade financeira:
- **(A)** Comanda Digital é o caixa; pagar a comanda **dispara** `status/finalizado` na Trinks (e idealmente um lançamento lá). Trinks vira só agenda.
- **(B)** Trinks é o caixa; a comanda só registra consumo e não "fecha" financeiramente por conta própria.

Essa decisão muda o escopo das tasks de pagamento/finalização. **Recomendo (A)** para manter o totem funcional como ponto de cobrança, sincronizando o resultado para a Trinks.

---

## 10. Sem campos de idempotência externa além dos propostos

**Hoje:** nenhum model tem `external_id`/`trinksId`.

**Trinks:** todo sync/webhook depende de IDs estáveis (`IdDoAgendamento`, `IdDoClienteNoEstabelecimento`).

**Risco:** sem chaves externas idempotentes, qualquer reprocesso de webhook ou sync cria duplicidade.

**Coberto pelas tasks:** COMADIG-13 (espelho com `trinksId @unique`) + dedup por `MessageId` (COMADIG-16). Os IDs externos em `Cliente`/`Servico`/`Usuario` (itens 2, 3, 4 acima) ficam na **COMADIG-23** (Módulo de Inconsistências).

---

## Resumo das decisões

Decisões **fechadas** em 2026-09-04 (confirmadas pelo dono). Cada decisão vira uma task no módulo **"Correções de Inconsistências (Trinks)"**.

| # | Decisão | Status | Definição adotada | Task |
|---|---------|--------|-------------------|------|
| D1 | Preço do serviço na comanda | ✅ Fechado | Preço do **agendamento** + mapear `Servico.trinksId` | COMADIG-24 |
| D2 | Chave do cliente | ✅ Fechado | Guardar `Cliente.trinksId` + normalizar CPF (só dígitos) | COMADIG-23 / 22 |
| D3 | Mapear profissional (`Usuario`) | ✅ Fechado | Adicionar `Usuario.trinksId`; atribuir à comanda | COMADIG-27 |
| D4 | Múltiplas comandas ABERTA | ✅ Fechado | Agendamento **adota** a comanda aberta do mesmo cliente | COMADIG-25 |
| D5 | Convidados no fluxo de agendamento | ✅ Escopo | Fora do escopo inicial (só CPF). Limite conhecido. | — |
| D6 | Fonte da verdade do pagamento | ✅ Fechado | **Comanda é o caixa**; pagar → dispara `finalizado` na Trinks | COMADIG-28 |
| D7 | `reabrir` checa agendamento? | ✅ Fechado | Bloquear reabrir se agendamento Finalizado/Cancelado/Faltou | COMADIG-29 |
| D8 | Item do serviço editável? | ✅ Escopo | Proteger item-base (qty≥1), extras livres | COMADIG-26 |

---

## Ordem de execução (ordem de dependência)

Dois módulos no Plane, a executar **nesta ordem**:

### Módulo 1 — Integração Trinks (fundação; sem ele o módulo 2 não faz sentido)
| Ordem | Task | O que entrega |
|-------|------|---------------|
| 1 | COMADIG-13 | Tabela `AgendamentoTrinks` + relação com `Comanda` |
| 2 | COMADIG-14 | Cliente HTTP da API Trinks (`lib/trinks-client.ts`) |
| 3 | COMADIG-16 | Endpoint webhook (confirmação SNS + roteamento + dedup) |
| 4 | COMADIG-15 | Handler de inclusão: upsert cliente + abrir comanda |
| 5 | COMADIG-17 | Handler de alteração: reagendamento + sync da comanda |
| 6 | COMADIG-18 | Handler de exclusão: cancelamento condicional |
| 7 | COMADIG-19 | View admin de agendamentos + comandas |
| 8 | COMADIG-20 | Sync periódico (pull) como fallback |
| 9 | COMADIG-21 | Testes de integração (payloads mockados) |

### Módulo 2 — Correções de Inconsistências (refina o módulo 1; depende dele)
| Ordem | Task | Decisão | Dependência |
|-------|------|---------|-------------|
| 1 | COMADIG-23 | Identidades externas (`Cliente/Servico/Usuario.trinksId`) | COMADIG-13 |
| 2 | COMADIG-22 | Normalizar CPF (webhook + totem) | COMADIG-23, 15 |
| 3 | COMADIG-24 | Precificar pelo agendamento (D1) | COMADIG-23, 15, 17 |
| 4 | COMADIG-25 | Adotar comanda ABERTA (D4) | COMADIG-15 |
| 5 | COMADIG-26 | Proteger item-base (D8) | COMADIG-15 |
| 6 | COMADIG-27 | Profissional na comanda (D3) | COMADIG-23, 15 |
| 7 | COMADIG-28 | Pagar → finalizado na Trinks (D6) | COMADIG-14, 13 |
| 8 | COMADIG-29 | Reabrir valida agendamento (D7) | COMADIG-13, 17 |
| 9 | COMADIG-30 | Gatilhos ciclo de vida (EmAtendimento/Finalizado) | COMADIG-17, 25 |

> **Regra prática:** entregar o Módulo 1 completo antes de iniciar o Módulo 2. Dentro do Módulo 2, a ordem acima já respeita as dependências (identidades primeiro, pois quase tudo usa os `trinksId`).
