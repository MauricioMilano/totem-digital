# Fluxo do Totem — Documentação

Documento que descreve o fluxo de autoatendimento do totem (quiosque) do sistema
`comanda-digital`. Implementado como rotas Next.js App Router no diretório
`src/app/totem/`, orquestrado por dois hooks cliente (`use-comanda` e
`use-totem-session`) e apoiado por rotas de API no diretório `src/app/api/`.

---

## 1. Visão Geral

O totem é a tela de autoatendimento onde o cliente do barbeiro inicia, acompanha
e paga seu consumo sem precisar de um atendente. O fluxo segue a lógica de uma
"comanda" tradicional de bar/bebaria:

```
Cliente → identifica (ou abre como convidado) → escolhe serviços →
escolhe bebidas → escolhe produtos → revisa comanda →
abre/mescla a comanda → escolhe pagamento → paga → sucesso
```

Além do fluxo linear de *novo pedido*, o totem também permite *consultar*
comandas ativas já existentes (via "Minha Conta").

### Stack e convenções

- **Framework:** Next.js (App Router) com React e `use client`.
- **Linguagem:** TypeScript.
- **Banco:** PostgreSQL via Prisma.
- **UI:** Componentes customizados em `src/components/shared/` e `src/components/ui/`.
- **Session state:** `sessionStorage` do navegador (não há cookies de sessão para o totem).
- **Idioma:** Português (Brasil).

---

## 2. Arquitetura e Estrutura

### 2.1 Estrutura de arquivos

```
src/
├── middleware.ts                          # Proteção de rotas (auth) + rotas públicas do totem
├── hooks/
│   ├── use-totem-session.ts               # Controle de sessão (sessionStorage) e timeout
│   └── use-comanda.ts                     # Estado global do pedido/carrinho
├── components/
│   └── totem/
│       ├── totem-drawer.tsx               # Carrinho flutuante (barra inferior)
│       └── pagamento-selector.tsx         # Seleção de forma de pagamento/parcelas
└── app/
    └── totem/
        ├── layout.tsx                     # Layout + timeout de inatividade
        ├── page.tsx                       # Início (Escolha / Identificação)
        ├── servicos/page.tsx              # 1) Serviços
        ├── bebidas/page.tsx               # 2) Bebidas
        ├── produtos/page.tsx              # 3) Produtos
        ├── resumo/page.tsx                # 4) Resumo / abrir comanda
        ├── pagamento/page.tsx             # 5) Pagamento
        ├── sucesso/page.tsx               # 6) Sucesso
        ├── nova-page (novo-cliente)       # Cadastro de novo cliente
        ├── minha-comanda/page.tsx         # Consultar comanda ativa do cliente
        └── comandas/page.tsx              # Listar comandas ativas (busca por nome)

src/api/
├── clientes/route.ts            POST            (cadastra cliente)
├── clientes/[cpf]/route.ts      GET             (busca cliente por CPF)
├── servicos/route.ts            GET             (lista serviços)
├── cardapio/bebidas/route.ts    GET             (lista bebidas)
├── cardapio/categorias-bebida   GET             (lista categorias de bebida)
├── cardapio/produtos/route.ts   GET             (lista produtos)
├── cardapio/categorias-produt   GET             (lista categorias de produto)
├── formas-pagamento/route.ts    GET             (lista formas de pagamento)
└── comandas/
    ├── route.ts                 POST            (abre comanda)
    ├── totem/[clienteId]/route.ts  GET          (comanda ativa do cliente)
    ├── totem/ativas/route.ts     GET             (comandas ativas p/ busca)
    ├── totem/merge/route.ts      POST            (mescla itens à comanda existente)
    └── [id]/pagar/route.ts       POST            (marca comanda como PAGA)
```

### 2.2 Duas camadas de estado

O fluxo utiliza **dois stores independentes**, ambos persistidos em
`sessionStorage`:

| Store | Onde vive | O que guarda | Chave `sessionStorage` |
|-------|-----------|--------------|------------------------|
| `use-totem-session` | Client | Cliente logado (`clienteId`), ID da comanda aberta, última atividade | `totem-cliente`, `comanda-id`, `totem-last-activity` |
| `use-comanda` | Client (state em memória) | Status do cliente, itens do pedido, parcelas, maioridade | `totem-carrinho` |

O `use-totem-session` cuida da **identidade e do ciclo de vida da sessão**;
o `use-comanda` cuida do **conteúdo do pedido**. Isso permite, por exemplo,
escolher itens (carrinho) *antes* de confirmar o cliente, e mesclar esse
carrinho a uma comanda já existente.

---

## 3. Sessão e Segurança

### 3.1 `use-totem-session.ts`

Responsável pela persistência da identidade e pela expiração por inatividade.

- **`getCliente()` / `setCliente(id)`** — lê/grava o ID do cliente em
  `totem-cliente`. O valor `"guest"` representa o cliente convidado.
- **`updateLastActivity()` / `getLastActivity()`** — mantêm a última ação em
  `totem-last-activity`; usadas no timeout de inatividade.
- **`getComandaId()` / `setComandaId(id)`** — guardam o ID da comanda aberta em
  `comanda-id` (usado na página de sucesso).
- **`clearTotemSession()`** — remove todas as chaves de sessão.
- **`isAuthenticated()`** — `true` quando o cliente é distinto de null/`"guest"`.

### 3.2 `layout.tsx` — Timeout de inatividade

O layout aplica uma regra global a toda a árvore `/totem`:

- A cada **5 minutos** sem atividade (`SESSION_TIMEOUT = 5 * 60 * 1000`), o
  cliente é redirecionado para `/totem` (início) com um toast de "Sessão
  expirada".
- Os checks rodam a cada **10 segundos** via `setInterval`.
- **`updateLastActivity()`** é chamado em toda navegação, renovando o timer.

> Nota: o timeout redireciona para o início, mas **não limpa** o carrinho nem a
> identidade. A limpeza explícita ocorre no fim do fluxo (página de sucesso) ou
> via botões "Cancelar"/"Voltar"/"Trocar CPF".

### 3.3 Middleware (`src/middleware.ts`)

O middleware de autenticação (via `@/lib/auth`) decide o acesso:

- **Rotas `/totem/*` e `/`** — públicas (não exigem login).
- **Rotas `/admin`, `/cardapio`, `/servicos`, `/clientes`, `/comandas`** —
  protegidas; rediretionam para `/admin/login` se não autenticado.

Isso isola o totem da proteção do painel admin, permitindo acesso do cliente.

---

## 4. O Fluxo (Passo a Passo)

### 4.1 Início — `src/app/totem/page.tsx`

Página de entrada com dois caminhos:

```
┌───────────────────────────────────────────────────────┐
│                       Início (/totem)                   │
│                                                         │
│   [ Novo Pedido ]   →  (passo "identification")         │
│                                                         │
│   [ Minha Conta ]   →  /totem/comandas                  │
│                                                         │
│   (se houver comanda aberta: botão "Continuar com       │
│    minha comanda aberta" → /totem/minha-comanda)         │
└───────────────────────────────────────────────────────┘
```

**Passo "selection"** (estado inicial): dois cards grandes.
- **Novo Pedido** → entra no fluxo de identificação.
- **Minha Conta** → `/totem/comandas` (busca de comandas ativas).
- Se o cliente (já identificado no sessionStorage) tiver uma comanda aberta em
  `ABERTA`, aparece um botão adicional "Continuar com minha comanda aberta".

**Passo "identification"** (CPF):
1. O cliente digita o CPF (formatado com `formatCPF`).
2. **Validação:** deve ter exatamente 11 dígitos.
3. `GET /api/clientes/{cpf}`:
   - **404** → redireciona para `/totem/novo-cliente?cpf={cpf}` (Cadastro).
   - **OK** → `GET /api/comandas/totem/{clienteId}`:
     - Se houver comanda aberta → abre o **modal "Conta em Aberto"** e armazena
       o cliente via `setCliente` (sem redirecionar ainda).
     - Se não houver → `setCliente` e vai direto para `/totem/servicos`.

**Modal "Conta em Aberto":**
- **Adicionar Itens à Conta Existente** → `/totem/servicos` (o cliente seguirá o
  fluxo e depois mescla os itens — ver `merge`).
- **Apenas Ver meu Consumo** → `/totem/minha-comanda`.

### 4.2 Serviços — `src/app/totem/servicos/page.tsx`

- Garante o cliente (senão redireciona para `/totem`).
- `hydrateComandaFromStorage()` recupera o carrinho.
- `GET /api/servicos` lista os serviços ativos.
- O cliente seleciona um ou mais serviços (checkbox).
- Checkbox opcional **"Maioridade"** (`setMaioridade`) — libera o cardápio de
  bebidas alcoólicas nas etapas seguintes.
- **"Continuar"** → adiciona cada serviço selecionado ao carrinho via `addItem`
  (`tipo: "servico"`) e avança para `/totem/bebidas`.
- **"Trocar CPF"** (cabeçalho) → `clearTotemSession()` e volta ao início.
- **"Voltar"** → `/totem`.

### 4.3 Bebidas — `src/app/totem/bebidas/page.tsx`

- `GET /api/cardapio/bebidas` + `GET /api/cardapio/categorias-bebida`.
- **Filtro de maioridade:** se `!maioridade`, bebidas alcólicas são filtradas
  da lista (`.filter((b) => !b.possuiAlcool)`).
- Filtro por categoria (chips no topo).
- Controle de quantidade (`+`/`-`) por bebida.
- **"Continuar"** → adiciona cada bebida como `addItem({ tipo: "bebida" })` e
  avança para `/totem/produtos`.
- **"Voltar"** → `/totem/servicos`.

### 4.4 Produtos — `src/app/totem/produtos/page.tsx`

- `GET /api/cardapio/produtos` + `GET /api/cardapio/categorias-produto`.
- Mesmo padrão de bebidas: filtros por categoria + controle de quantidade.
- **Scaffold de carregamento** com `Skeleton` enquanto carrega.
- **"Revisar Pedido"** (Continuar) → adiciona produtos como `addItem({ tipo: "produto" })`
  e avança para `/totem/resumo`.
- **"Voltar"** → `/totem/bebidas`.

### 4.5 Resumo da Comanda — `src/app/totem/resumo/page.tsx`

- Subcreve a mudanças do carrinho via `subscribeToComanda` (estado reativo).
- Exibe os itens com controle de quantidade (`updateQuantidade`), remoção
  (`removeItem`) e **total** (`getTotal`).
- Caso o carrinho esteja vazio (mas com cliente), mostra tela "Nenhum item
  selecionado".

**`handleAbrirComanda()`** — lógica central de abertura/mesclagem:
1. Valia: pelo menos um item.
2. Busca se o cliente já tem comanda aberta: `GET /api/comandas/totem/{clienteId}`.
   - **Se existir** → `POST /api/comandas/totem/merge` com os itens do carrinho e
     armazena o ID via `setComandaId`.
   - **Se não existir** → `POST /api/comandas` (abre nova comanda) e armazena o
     ID retornado.
3. `limparComanda()` (limpa o carrinho) e avança para `/totem/pagamento`.

### 4.6 Pagamento — `src/app/totem/pagamento/page.tsx`

- Garante o cliente e carrega a comanda ativa: `GET /api/comandas/totem/{clienteId}`.
- Exibe o **total a pagar** e o componente `PagamentoSelector`.
- **`PagamentoSelector`** (`src/components/totem/pagamento-selector.tsx`):
  - `GET /api/formas-pagamento` lista as formas ativas.
  - **Auto-seleção**: a primeira forma é selecionada automaticamente se nenhuma
    estiver marcada.
  - Cada forma mostra ícone (Pix/cartão/dinheiro), descrição, e, se permitir
    parcelamento, botões de parcelas (`1x` … `maxParcelas`) com valor unitário.
  - Formas sem parcelamento mostram "Pagamento à vista".
- **`handleConfirmPayment()`**:
  1. Valia uma forma de pagamento selecionada.
  2. `POST /api/comandas/{id}/pagar` com `{ formaPagamentoId, quantidadeParcelas }`.
  3. Sucesso → toast + `/totem/sucesso`.

### 4.7 Sucesso — `src/app/totem/sucesso/page.tsx`

- Confirmação do pagamento com animação e hash da comanda (`#{últimos 8}`).
- **`getComandaId()`** exibe o identificador da comanda.
- **"Nova Comanda"** → `clearTotemSession()` e volta ao início, fechando o ciclo.

### 4.8 Cadastro de Novo Cliente — `src/app/totem/novo-cliente/page.tsx`

- Parcialmente renderizado com `Suspense` (para `useSearchParams`).
- Recebe o CPF via query string (`?cpf={}`) já validado no início.
- Formulário: nome (obrigatório), telefone e email (opcionais).
- **`POST /api/clientes`** cadastra o cliente.
- Sucesso → `setCliente` + `/totem/servicos`.
- **"Continuar como Convidado"** → `setCustomerStatus("GUEST")` + `/totem/servicos`.
- **"Cancelar"** → `clearTotemSession()` e `/totem`.

### 4.9 Minha Comanda — `src/app/totem/minha-comanda/page.tsx`

- Exibe a comanda ativa do cliente identificado: `GET /api/comandas/totem/{clienteId}`.
- Lista os itens, quantidades, valores e **total a pagar**.
- **"Pagar Comanda"** → `/totem/pagamento`.
- **"Voltar para Início"** → `/totem`.

### 4.10 Comandas Ativas — `src/app/totem/comandas/page.tsx`

- Acesso via card "Minha Conta" na página inicial.
- `GET /api/comandas/totem/ativas` lista **todas as comandas ativas** do salão.
- Busca por nome do cliente (TextInput no topo).
- Cada card mostra cliente, horário e total; ao selecionar, `setCliente` e vai
  para `/totem/minha-comanda`.

---

## 5. Fluxo de Dados (Diagrama)

```mermaid
flowchart TD
    START([Início /totem]) --> CHOICE{Escolha}
    CHOICE -->|Novo Pedido| ID[Identificação por CPF]
    CHOICE -->|Minha Conta| LISTA[Listar Comandas Ativas<br/>/totem/comandas]
    CHOICE -->|Continuar comanda aberta| MINHA[Minha Comanda]

    ID -->|CPF registrado| CHECK{Comanda aberta?}
    ID -->|CPF não registrado| CAD[Cadastro /totem/novo-cliente]
    ID -->|Convidado| SVC
    CHECK -->|Sim| MODAL{Modal Conta em Aberto}
    CHECK -->|Não| SVC[Serviços]
    MODAL -->|Adicionar à existente| SVC
    MODAL -->|Apenas consumir| MINHA

    CAD --> SVC

    SVC -->|Maioridade + serviços| BEB[Bebidas]
    BEB -->|categorias + qtd| PROD[Produtos]
    PROD -->|categorias + qtd| RES[Resumo da Comanda]

    RES -->|handleAbrirComanda| MERGE{Já tem comanda?}
    MERGE -->|Sim| MERGE_API[POST /totem/merge]
    MERGE -->|Não| NEW_API[POST /comandas<br/>(abre comanda)]
    MERGE_API --> PAG
    NEW_API --> PAG

    PAG [Pagamento + PagamentoSelector] -->|POST /pagar| SUCC[Sucesso]
    MINHA --> PAG
    LISTA --> MINHA

    SUCC -->|Nova Comanda| START
```

---

## 6. Rotas de API utilizadas pelo totem

| Método + rota | Finalidade | Retorno principal |
|----------------|------------|-------------------|
| `GET /api/clientes/{cpf}` | Buscar cliente por CPF | cliente (ou 404) |
| `POST /api/clientes` | Cadastrar novo cliente | cliente criado |
| `GET /api/servicos` | Listar serviços ativos | `servico[]` |
| `GET /api/cardapio/bebidas` | Listar bebidas (opc. categoria) | `bebida[]` |
| `GET /api/cardapio/categorias-bebida` | Categorias de bebida | `categoria[]` |
| `GET /api/cardapio/produtos` | Listar produtos | `produto[]` |
| `GET /api/cardapio/categorias-produto` | Categorias de produto | `categoria[]` |
| `GET /api/formas-pagamento` | Formas de pagamento | `forma[]` |
| `GET /api/comandas/totem/{clienteId}` | Comanda **ABERTA** do cliente | comanda (ou 404) |
| `GET /api/comandas/totem/ativas` | Todas as comandas ativas | `comanda[]` formatada |
| `POST /api/comandas/totem/merge` | Mesclar itens à comanda existente | `{ success }` |
| `POST /api/comandas` | Abrir nova comanda | comanda criada (201) |
| `POST /api/comandas/{id}/pagar` | Marcar comanda como **PAGA** | comanda atualizada |

### 6.1 Regras de negócio relevantes

- **Abertura de comanda (`POST /api/comandas`):** exige lista de itens não vazia;
  resolve preços (`resolveItemPrices`), valida/decrementa estoque
  (`validateAndDecrementStock`) e calcula o total.
- **Pagamento (`POST /api/comandas/{id}/pagar`):** só permite pagamento se a
  comanda estiver `ABERTA`; atualiza para `PAGA`, define `pagaEm`, forma de
  pagamento e número de parcelas.
- **Merge (`POST /api/comandas/totem/merge`):** adiciona os itens do carrinho à
  comanda já existente dentro de uma transação e recalcula o total.
- **Bebidas:** só bebidas com `ativo: true`.
- **Serviços:** só serviços com `ativo: true`.

---

## 7. Estados e Ciclo de Vida

### 7.1 Status do cliente (`use-comanda`)

| Status | Significado |
|--------|-------------|
| `IDENTIFIED` | Cliente identificado por CPF (registrado). |
| `REGISTERING` | Cliente no processo de cadastro. |
| `GUEST` | Convidado (sem CPF/identificação). |

### 7.2 Status da comanda (Prisma)

- **ABERTA** — aberta, com itens, aguardando pagamento.
- **PAGA** — paga e finalizada (aqui o totem encerra o ciclo).

> Observação: o schema também contempla `FECHAR`/`REABIR` (ver `fechar/` e
> `reabrir/` em `[id]/`), mas essas rotas não fazem parte do fluxo de totem.

---

## 8. Componentes Compartilhados do Totem

### 8.1 `TotemDrawer` (`src/components/totem/totem-drawer.tsx`)

- Barra inferior fixa (z-40) presente em toda navegação do totem (renderizada no
  `layout`).
- Exibe: nº de itens no carrinho, total parcial, e um ícone de gaveta que abre o
  drawer.
- Dentro do drawer: lista de itens editável (quantidade +/-, remover), total
  parcial, botões "Continuer Comprando" e "Finalizar Pedido" (vai para
  `/totem/resumo`).
- **Oculta** a barra nas páginas `/totem` e `/totem/sucesso` e quando o carrinho
  está vazio.

### 8.2 `PagamentoSelector` (`src/components/totem/pagamento-selector.tsx`)

- Lista formas de pagamento com ícone por tipo (Pix, cartão, dinheiro).
- Radio-button de seleção + parcelas (quando aplicável) ou indicador "à vista".
- Auto-seleciona a primeira forma ao carregar.

---

## 9. Fluxo por Extensões (Tópicos Relacionados)

- **Gestão de sessão:** coberta pela extensão `totem-session-management`
  (`openspec/specs/totem-session-management/spec.md`), que formaliza a
  persistência em `sessionStorage`, a validação de token nas páginas e a
  limpeza ao final do fluxo.
- **Redesenho da experiência do totem (v2) e redesenho do workflow da comanda**
  estão documentados nas extensões
  `redesign-totem-experience-v2` e `redesign-comanda-workflow` em
  `openspec/changes/`.
- **Harden da API do totem** (robustez da API) está na extensão `harden-totem-api`.

---

## 10. Pontos de Atenção / Possíveis Melanorias

> Observações de análise, não necessariamente bugs.

1. **O timeout de inatividade não limpa o carrinho/identidade** — o cliente pode
   voltar ao início com o carrinho e a identidade intactos. Dependendo da política
   de negócio, pode ser desejável limpar ao expirar.
2. **`PagamentoSelector`** não expõe controle explícito de "voltar à lista de
   formas"; a navegação "Voltar para Resumo" leva de volta a `minha-comanda`.
3. **Controle de estoque** é feito na abertura da comanda (`POST /api/comandas`)
   e não no carrinho — o preço/estoque é resolvido server-side no momento da
   criação.
4. **`totem/abertas`** expõe todas as comandas ativas ao salão — útil para a
   tela de busca, mas vale revisar permissões se o totem for compartilhado.
