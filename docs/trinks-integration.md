# Integração Comanda Digital × Trinks

## Visão Geral

| Sistema | Papel | Stack |
|---------|-------|-------|
| **Comanda Digital** (este repo) | Gestão de comandas em tempo real via totem touchscreen | Next.js 15 + Prisma + PostgreSQL |
| **Trinks** | Agenda/scheduling do estabelecimento (agendamentos, clientes, profissionais) | SaaS — API REST `https://api.trinks.com` |

A integração permite que cada **agendamento Trinks** abra/associe automaticamente uma **comanda**, e que mudanças no agendamento (reagendamento, cancelamento) reflitam no estado da comanda.

---

## 1. Autenticação Trinks

- **Tipo:** ApiKey
- **Header:** `X-Api-Key: <seu-token>`
- **Escopo por estabelecimento:** header `estabelecimentoId` em todas as rotas
- **Obtenção do token:** painel Trinks → Minha Área → Token de API Pessoal

### Variáveis de ambiente sugeridas

```env
TRINKS_API_KEY=seu-token-aqui
TRINKS_ESTABELECIMENTO_ID=1253
```

---

## 2. Endpoints Relevantes (Trinks REST)

Base: `https://api.trinks.com`

### 2.1 Agendamentos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/agendamentos` | Listar agendamentos (filtros: `clienteId`, `dataInicio`, `dataFim`, `page`, `pageSize`) |
| POST | `/v1/agendamentos` | Criar agendamento |
| GET | `/v1/agendamentos/{id}` | Detalhe de um agendamento |
| PUT | `/v1/agendamentos/{agendamentoId}` | Editar (reagendar) |
| PATCH | `/v1/agendamentos/{agendamentoId}/status/confirmado` | Confirmar |
| PATCH | `/v1/agendamentos/{agendamentoId}/status/cancelado` | Cancelar |
| PATCH | `/v1/agendamentos/{agendamentoId}/status/ematendimento` | Em atendimento |
| PATCH | `/v1/agendamentos/{agendamentoId}/status/finalizado` | Finalizado |
| PATCH | `/v1/agendamentos/{agendamentoId}/status/clientefaltou` | Cliente faltou |

**Headers obrigatórios:** `X-Api-Key`, `estabelecimentoId`

### 2.2 Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/v1/clientes` | Listar (filtros: `nome`, `cpf`, `email`, `telefone`, `page`, `pageSize`) |
| POST | `/v1/clientes` | Criar cliente |
| GET | `/v1/clientes/{id}` | Detalhes do cliente (inclui `cpf`, `nome`, `telefone[]`, `etiquetasAssociadas[]`) |
| PUT | `/v1/clientes/{clienteId}` | Editar |
| DELETE | `/v1/clientes/{clienteId}` | Excluir |

### 2.3 Profissionais / Serviços (contexto)

| Método | Rota |
|--------|------|
| GET | `/v1/profissionais` |
| GET | `/v1/servicos` |
| GET | `/v1/agendamentos/profissionais/{data}` |

---

## 3. Webhooks (Eventos) — via Amazon SNS

O Trinks envia **todos** os eventos para **uma única URL** cadastrada. O transporte é **SNS HTTP/HTTPS**, o que significa:

1. Ao cadastrar a URL, o SNS envia um POST com `Type: "SubscriptionConfirmation"` e um campo `SubscribeURL`.
2. Nosso endpoint precisa **responder 200** para aquele `SubscribeURL` (GET ou POST conforme o protocolo) para confirmar a assinatura.
3. Depois, as mensagens chegam com a estrutura SNS base:

```json
{
  "Message": "<JSON do evento>",
  "MessageId": "uuid",
  "Type": "Notification",
  "Timestamp": "2026-09-04T12:00:00Z",
  "Signature": "...",
  "SigningCertURL": "https://sns.s3.amazonaws.com/cert.pem",
  "Subject": "Trinks Event"
}
```

> **Importante:** o `Message` é uma **string JSON** — precisa de `JSON.parse()` antes do processamento.

### 3.1 Eventos de Agendamento (os que interessam)

| TipoDeEvento | Evento | Action | Descrição |
|---|---|---|---|
| 11 | Inclusão de Agendamento | 1 | Novo agendamento criado |
| 12 | Alteração de Agendamento | 2 | Reagendamento (mudança de data/hora), mudança de status, etc. |
| 13 | Exclusão de Agendamento | 3 | Agendamento cancelado/removido |

#### Payload — Inclusão/Alteração (resumo dos campos)

```json
{
  "Action": 1,
  "TipoDeEvento": 11,
  "IdDoEstabelecimento": 1253,
  "IdDoCliente": 1498,
  "IdDoClienteNoEstabelecimento": 313603,
  "IdDoProfissional": 8398,
  "IdDoServico": 208,
  "NomeDoServicoNoEstabelecimento": "Corte + Barba",
  "IdDoAgendamento": 71429,
  "PrecoDoServicoNoAgendamento": "100.00",
  "DuracaoDoAgendamento": 40,
  "DataHoraInicioDoAgendamento": "2026-09-04T16:00:00",
  "DataHoraFimDoAgendamento": "2026-09-04T16:40:00",
  "Status": "Confirmado",
  "Origem": "Aplicativo",
  "NomeDoCliente": "Ágata Cristina",
  "CpfDoCliente": "111.111.111-11",
  "EmailDoCliente": "agata@teste.com",
  "TelefoneDoCliente": [{ "DDD": "21", "Numero": "99999999" }],
  "DataHoraEventoGerado": "2026-09-04T09:45:59"
}
```

#### Payload — Exclusão (cancelamento)

Idêntico, com `Action: 3`, `TipoDeEvento: 13` e `Status: "Cancelado"`.

### 3.2 Outros Eventos (para referência)

| TipoDeEvento | Evento |
|---|---|
| 1 | Fechamento de Conta |
| 2 | Estorno de Conta |
| 3 | Inclusão de Cliente |
| 4 | Alteração de Cliente |
| 5-7 | Profissional (CRUD) |
| 8-10 | Estabelecimento (CRUD) |

---

## 4. Mapeamento de Identidades

```
┌──────────────────────┐          ┌──────────────────────────┐
│   TRINKS             │          │   COMANDA DIGITAL        │
│                      │          │                          │
│  IdDoClienteNoEstab  │◄────────►│  Cliente.cpf (unique)    │
│  CpfDoCliente        │          │  Cliente.id (cuid)       │
│                      │          │                          │
│  IdDoAgendamento     │◄────────►│  AgendamentoTrinks.id    │
│  NomeDoServicoNoEtab │          │  AgendamentoTrinks.nomeServico │
└──────────────────────┘          └──────────────────────────┘
```

**Chave de união:** `CPF` é o identificador natural comum entre os dois sistemas.

- O totem identifica o cliente por **CPF**.
- A API Trinks retorna `cpf` no detalhe do cliente e `CpfDoCliente` no webhook.
- Quando não há CPF (convidado/one-shot), usamos `IdDoClienteNoEstabelecimento` como fallback.

---

## 5. Proposta de Integração — Modelo de Dados

### 5.1 Nova tabela: `AgendamentoTrinks`

Guarda o espelho local do agendamento e a ligação com a comanda:

```prisma
model AgendamentoTrinks {
  id                  String   @id @default(cuid())
  trinksId            Int      @unique          // IdDoAgendamento
  clienteCpf          String?                    // chave de união
  clienteNome         String?
  clienteTrinksId     Int?                       // IdDoClienteNoEstabelecimento
  profissionalId      Int?
  servicoNome         String?
  precoServico        Decimal  @default(0) @db.Decimal(10,2)
  duracaoMin          Int?
  dataInicio          DateTime
  dataFim             DateTime
  status              String                      // Confirmado, Pendente, Cancelado, EmAtendimento, Finalizado, ClienteFaltou
  origem              String?
  observacao          String?

  // Ligação com a comanda
  comandaId           String?   @unique
  comanda             Comanda?  @relation(fields: [comandaId], references: [id])

  // Histórico de reagendamento (JSON array de alterações)
  historico           Json?     // [{ action, oldStart, newStart, timestamp }]

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([clienteCpf])
  @@index([dataInicio])
}
```

### 5.2 Alteração no `Comanda`

Adicionar back-reference:

```prisma
model Comanda {
  // ... campos existentes ...
  agendamentoTrinks   AgendamentoTrinks?
}
```

---

## 6. Fluxo de Integração (Event-Driven)

### 6.1 Endpoint Webhook

**Rota:** `POST /api/webhooks/trinks`

```
SNS POST → /api/webhooks/trinks
         │
         ├─ Type == "SubscriptionConfirmation"
         │    → GET/POST SubscribeURL → return 200 (confirma assinatura)
         │
         └─ Type == "Notification"
              → JSON.parse(Message)
              → rotear por TipoDeEvento:
                  11 → handleAgendamentoInclusao(payload)
                  12 → handleAgendamentoAlteracao(payload)
                  13 → handleAgendamentoExclusao(payload)
```

### 6.2 Handler — Inclusão de Agendamento (TipoDeEvento 11)

```
1. Upsert Cliente local por CPF (criar se não existir)
   - nome, cpf, telefone, email do payload

2. Criar AgendamentoTrinks com os dados do payload
   - trinksId = IdDoAgendamento
   - status = Confirmado/Pendente
   - dataInicio / dataFim

3. Abrir Comanda automaticamente:
   - clienteId = Cliente local
   - itens = [ { servicoNome, precoServico } ]  // pré-preencher com o serviço agendado
   - status = ABERTA
   - associar comandaId no AgendamentoTrinks

4. (Opcional) Se Status == "EmAtendimento" → já abrir a comanda ativa
```

### 6.3 Handler — Alteração de Agendamento (TipoDeEvento 12)

Cobre **reagendamento** (mudança de data/hora), mudança de status, troca de serviço:

```
1. Buscar AgendamentoTrinks por trinksId

2. Registrar no historico:
   { action: "alteracao", oldStart, newStart, timestamp }

3. Atualizar campos:
   - dataInicio / dataFim (reagendamento)
   - status
   - servicoNome / precoServico (se mudou)

4. Se a comanda ainda está ABERTA:
   → atualizar itens da comanda se o serviço/preço mudou
   → NÃO cancelar a comanda (cliente pode ter adicionado bebidas/produtos)

5. Se status virou "Cancelado":
   → ver handler de exclusão (6.4)
```

### 6.4 Handler — Exclusão/Cancelamento (TipoDeEvento 13)

```
1. Buscar AgendamentoTrinks por trinksId

2. Atualizar status = "Cancelado"

3. Se a comanda associada está ABERTA:
   → opção A: cancelar a comanda (status CANCELADA)
   → opção B: manter aberta se o cliente já adicionou itens extras
   (configurável — ver seção 7)
```

### 6.5 Handler — Status "Em Atendimento" (via PATCH ou webhook)

Quando o profissional marca o agendamento como **em atendimento**:

```
→ Verificar se já existe comanda ABERTA para aquele cliente + agendamento
→ Se não existir, abrir a comanda automaticamente
→ Atualizar dataInicio da comanda
```

---

## 7. Decisões de Negócio (configuráveis)

| Cenário | Opção A (conservadora) | Opção B (agressiva) |
|---------|----------------------|---------------------|
| Agendamento cancelado, comanda ABERTA sem itens extras | Cancelar a comanda | Manter aberta para o profissional decidir |
| Reagendamento para outro dia | Atualizar data no espelho; comanda segue ativa | Fechar a comanda se ainda não teve itens adicionados |
| Cliente faltou (`clientefaltou`) | Cancelar comanda | Marcar como CANCELADA + log |

Recomendação inicial: **Opção A** para cancelamento e falta, **Opção B** para reagendamento.

---

## 8. Sincronização por Pull (fallback)

Como webhooks podem ser perdidos (endpoint fora do ar), implementar um **sync periódico**:

```
GET /v1/agendamentos?dataInicio=hoje&dataFim=hoje+7d
→ diff com AgendamentoTrinks locais
→ criar os que faltam, atualizar os que mudaram
```

- Executar via cron (ex: a cada 5 min) ou API route chamada manualmente.
- Idempotente: usar `trinksId` como chave única.

---

## 9. Segurança do Webhook Endpoint

1. **Validar assinatura SNS** (opcional em dev, obrigatório em prod):
   - Baixar o certificado de `SigningCertURL`
   - Verificar `Signature` com RSA-SHA256
2. **Rate limiting** — proteger contra replay
3. **Idempotência** — usar `MessageId` do SNS para deduplicar (tabela `WebhookEventLog`)

---

## 10. Roadmap de Implementação

| Fase | Tarefa | Estimativa |
|------|--------|-----------|
| 1 | Migration Prisma: `AgendamentoTrinks` + back-ref em `Comanda` | 2h |
| 2 | Cliente HTTP Trinks (`lib/trinks-client.ts`) — auth, agendamentos, clientes | 3h |
| 3 | Endpoint webhook `POST /api/webhooks/trinks` (SNS confirmation + roteamento) | 4h |
| 4 | Handler de inclusão: upsert cliente + criar comanda automática | 3h |
| 5 | Handler de alteração: reagendamento + atualização de itens | 3h |
| 6 | Handler de exclusão: cancelamento condicional da comanda | 2h |
| 7 | Endpoint admin para listar agendamentos + comandas associadas | 3h |
| 8 | Sync periódico (pull) como fallback | 2h |
| 9 | Testes de integração (mock SNS payloads) | 3h |

---

## 11. Referências

- [Trinks API — Autenticação](https://trinks.readme.io/reference/autenticacao.md)
- [Trinks API — Listar agendamentos](https://trinks.readme.io/reference/get_v1-agendamentos.md)
- [Trinks API — Webhooks (SNS)](https://trinks.readme.io/reference/webhook.md)
- [Evento: Inclusão de Agendamento](https://trinks.readme.io/reference/evento-inclusão-de-agendamento.md)
- [Evento: Alteração de Agendamento](https://trinks.readme.io/reference/evento-alteração-de-agendamento.md)
- [Evento: Exclusão de Agendamento](https://trinks.readme.io/reference/evento-exclusão-de-agendamento.md)
- [Detalhes do Cliente](https://trinks.readme.io/reference/get_v1-clientes-id.md)
