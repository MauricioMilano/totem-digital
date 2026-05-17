# 💈 Barbearia — Comanda Digital

Sistema de comanda digital para barbearia operado via **totem touchscreen**, com tema editorial **Airtable Design System**.

## Funcionalidades

### 🖥️ Totem (Cliente)
- Input de CPF para identificação
- Cadastro de novos clientes
- Seleção de serviços (corte, barba, combo, etc.)
- Cardápio de bebidas com filtro por idade
- Produtos adicionais para venda
- Escolha da forma de pagamento (PIX, Cartão, Dinheiro)
- Opção de parcelamento no cartão de crédito
- Resumo da comanda com valor total

### 👨‍💼 Admin (Profissional)
- Dashboard com estatísticas
- CRUD de serviços
- CRUD de bebidas e categorias
- CRUD de produtos e categorias
- **CRUD de formas de pagamento** (com parcelamento configurável)
- Lista de clientes
- Gestão de comandas (abrir, fechar, pagar, reabrir)
- Detalhe da comanda com forma de pagamento e parcelas

## Stack

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Banco:** PostgreSQL (via Docker)
- **ORM:** Prisma
- **Autenticação:** NextAuth v5 (Credentials)
- **UI:** Shadcn/UI + Tailwind CSS
- **Tema:** Airtable Design System
- **Formulários:** React Hook Form + Zod

## Pré-requisitos

- Docker e Docker Compose
- Node.js 18+
- npm

## Setup

### 1. Subir o banco PostgreSQL

```bash
docker compose up -d
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

O arquivo `.env` já está configurado para desenvolvimento:

```
DATABASE_URL="postgresql://barbearia:barbearia123@localhost:5433/barbearia_comanda"
NEXTAUTH_SECRET="super-secret-key-change-in-production-123456"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Rodar migrations e seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Iniciar o servidor

```bash
npm run dev
```

### 6. Acessar

- **Totem:** http://localhost:3000/totem
- **Admin:** http://localhost:3000/login
- **Login padrão:** `admin@barbearia.com` / `admin123`

## Estrutura do Projeto

```
src/
├── app/
│   ├── (admin)/          # Área administrativa (protegida)
│   │   ├── login/        # Tela de login
│   │   ├── page.tsx      # Dashboard
│   │   ├── servicos/     # CRUD serviços
│   │   ├── cardapio/
│   │   │   ├── bebidas/         # CRUD bebidas
│   │   │   ├── produtos/        # CRUD produtos
│   │   │   └── formas-pagamento/ # CRUD formas de pagamento
│   │   ├── clientes/     # Lista de clientes
│   │   └── comandas/     # Gestão de comandas
│   ├── (totem)/          # Interface do totem
│   │   ├── page.tsx      # Input CPF
│   │   ├── novo-cliente/ # Cadastro novo cliente
│   │   ├── servicos/     # Seleção de serviços
│   │   ├── bebidas/      # Cardápio bebidas
│   │   ├── produtos/     # Produtos adicionais
│   │   ├── resumo/       # Resumo + pagamento
│   │   └── sucesso/      # Confirmação
│   └── api/              # API routes
├── components/
│   ├── admin/            # Componentes admin
│   ├── shared/           # Componentes Airtable (button, input)
│   ├── totem/            # Componentes totem
│   └── ui/               # Shadcn/UI components
├── hooks/
│   └── use-comanda.ts    # Estado global da comanda
└── lib/
    ├── auth.ts           # Config NextAuth
    ├── prisma.ts         # Cliente Prisma
    └── utils.ts          # Utilitários
```

## Tema Airtable

O sistema segue o design system editorial da Airtable:
- **White canvas** primário com tipo em **dark ink**
- Botões **near-black pill** como CTA primário
- Cards de **brand voltage** (coral, forest, dark) para momentos de impacto
- Tipografia Haas Grotesk em pesos modestos
- Espaçamento generoso (96px entre seções)
- Sistema de pagamento usa token `rounded.pill` como sub-sistema próprio

## Licença

MIT
