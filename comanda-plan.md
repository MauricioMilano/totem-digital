# 📋 Planejamento Detalhado: Sistema Totem Digital - Comanda Express

## 1. Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    TOTEM DIGITAL                            │
│              "Comanda Inteligente com Automação"             │
└─────────────────────────────────────────────────────────────┘
```

**Objetivo Principal:** Criar um terminal interativo que substitui a comanda tradicional, permitindo visualização de histórico, pedidos em tempo real e finalização flexível.

---

## 2. Arquitetura do Sistema

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Totem)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Tela de  │  │ Cardápio │  │ Comanda  │  │ Pagamento│    │
│  │ Login    │  │ Digital  │  │ Aberta   │  │ / QR Code│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Servidor)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ API REST │  │ Banco de  │  │ Cache    │  │ WebSocket│    │
│  │          │  │ Dados     │  │ Redis    │  │ Real-time│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico Sugerido

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | React Native / Flutter | Multiplataforma, performance nativa |
| **Backend** | Node.js + Express | Escalável, ecossistema rico |
| **Banco de Dados** | PostgreSQL + Redis | Relacional + Cache rápido |
| **Comunicação** | WebSocket (Socket.io) | Tempo real para comandas ativas |
| **Autenticação** | JWT + Session Management | Segurança e controle de acesso |

---

## 3. Fluxo Principal do Usuário

### 3.1 Diagrama de Estados da Comanda

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   AGUARDANDO │────▶│    PEDIDO   │────▶│   EM PAGAMENTO│
│              │◀────│             │◀────│              │
└─────────────┘     └─────────────┘     └─────────────┘
       ↑                    ↓                    ↓
       └───────────────────┴───────────────────┘
                   CONFIRMAÇÃO / CANCELAMENTO
```

### 3.2 Sequência de Telas (Wireframes Conceituais)

#### Tela 1: Login / Modo Atendimento

```
┌─────────────────────────────────────────────┐
│              TOTEM DIGITAL                  │
│                                            │
│    ┌──────────────────────────────────┐   │
│    │  Digite seu CPF para continuar   │   │
│    │                                 │   │
│    │     [________] [OK]             │   │
│    │                                 │   │
│    │  ── MODO ATENDIMENTO ─────────── │   │
│    │                                 │   │
│    │  Comandas Ativas:               │   │
│    │  • João S. (2 itens)            │   │
│    │  • Maria L. (1 item)           │   │
│    │  • Carlos M. (3 itens)         │   │
│    └──────────────────────────────────┘   │
│                                            │
│              [Voltar]                      │
└─────────────────────────────────────────────┘
```

#### Tela 2: Cardápio Digital

```
┌─────────────────────────────────────────────┐
│  < Voltar                    Totem Digital │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  🍔 CARDÁPIO - [Nome do Cliente]     │ │
│  ├──────────────────────────────────────┤ │
│  │                                     │ │
│  │  🥤 BEBIDAS                          │ │
│  │  ┌─────────┐ ┌─────────┐            │ │
│  │  │ Coca-Cola│ │ Guaraná │            │ │
│  │  │ R$ 6,00 │ │ R$ 6,00 │            │ │
│  │  └────┬────┘ └────┬────┘            │ │
│  │       │           │                 │ │
│  │  [Adicionar]   [Adicionar]          │ │
│  │                                     │ │
│  │  🍕 PRATOS                           │ │
│  │  ┌─────────┐ ┌─────────┐            │ │
│  │  │ Hamburguer│ │ Pizza  │            │ │
│  │  │ R$ 35,00 │ │ R$ 45,00 │           │ │
│  │  └────┬────┘ └────┬────┘            │ │
│  │       │           │                 │ │
│  │  [Adicionar]   [Adicionar]          │ │
│  │                                     │ │
│  └──────────────────────────────────────┘ │
│                                           │
│              [Continuar]                   │
└─────────────────────────────────────────────┘
```

#### Tela 3: Comanda Aberta (Resumo)

```
┌─────────────────────────────────────────────┐
│  < Voltar                    Totem Digital │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  📋 COMANDA #1234 - João Silva       │ │
│  ├──────────────────────────────────────┤ │
│  │                                     │ │
│  │  ITENS SELECIONADOS:                │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ 🥤 Coca-Cola                    │ │ │
│  │  │   Qtd: 2 | Subtotal: R$ 12,00    │ │ │
│  │  ├─────────────────────────────────┤ │ │
│  │  │ 🍔 Hamburguer Artesanal         │ │ │
│  │  │   Qtd: 1 | Subtotal: R$ 35,00    │ │ │
│  │  ├─────────────────────────────────┤ │ │
│  │  │ 💧 Água Mineral (Cortesias)     │ │ │
│  │  │   Qtd: 2 | Subtotal: R$ 4,00     │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                     │ │
│  │  ─────────────────────────────────── │ │
│  │  TOTAL: R$ 51,00                    │ │ │
│  │                                     │ │
│  │  [Adicionar Item]   [Finalizar]     │ │
│  └──────────────────────────────────────┘ │
│                                           │
│              [Cancelar Comanda]           │
└─────────────────────────────────────────────┘
```

#### Tela 4: Pagamento / Finalização

```
┌─────────────────────────────────────────────┐
│  < Voltar                    Totem Digital │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  💳 FINALIZAR PAGAMENTO              │ │
│  ├──────────────────────────────────────┤ │
│  │                                     │ │
│  │  TOTAL A PAGAR: R$ 51,00            │ │
│  │                                     │ │
│  │  ┌─────────┐ ┌─────────┐           │ │
│  │  │ Cartão  │ │ PIX     │           │ │
│  │  │ [Pagar] │ │ [Pagar] │           │ │
│  │  └─────────┘ └─────────┘           │ │
│  │                                     │ │
│  │  ┌─────────┐                       │ │
│  │  │ Levar ao│                       │ │
│  │  │ Caixa   │                       │ │
│  │  │ [OK]    │                       │ │
│  │  └─────────┘                       │ │
│  │                                     │ │
│  │  Código para o caixa: #12345        │ │
│  │  QR Code do PIX (opcional)          │ │
│  └──────────────────────────────────────┘ │
│                                           │
│              [Cancelar]                   │
└─────────────────────────────────────────────┘
```

---

## 4. Funcionalidades Detalhadas

### 4.1 Sistema de Autenticação e Permissões

#### Níveis de Acesso:

| Tipo | Descrição | Ações Permitidas |
|------|-----------|------------------|
| **Cliente** | Usuário final | Visualizar cardápio, fazer pedidos, pagar |
| **Atendente (Login)** | Funcionário com login | Todas as ações + Gerenciar comandas |
| **Atendente (Modo Público)** | Acesso rápido sem senha | Apenas visualização de comandas ativas |

#### Matriz de Permissões:

```javascript
const permissions = {
  cliente: {
    verCardapio: true,
    fazerPedido: true,
    visualizarHistorico: false,
    finalizarPagamento: true,
    cancelarComanda: false,
    acessoModoPublico: false
  },
  atendente: {
    verCardapio: true,
    fazerPedido: true,
    visualizarHistorico: true,
    finalizarPagamento: true,
    cancelarComanda: true,
    acessarTodasComandas: true,
    acessoModoPublico: true
  }
};
```

### 4.2 Sistema de Comandas Ativas (Real-time)

#### Estrutura de Dados da Comanda Aberta:

```json
{
  "id": "CMD-12345",
  "clienteId": "CLI-67890",
  "nomeCliente": "João Silva",
  "status": "PEDIDO", // AGUARDANDO, PEDIDO, PAGAMENTO, CONCLUÍDO
  "itens": [
    {
      "id": "ITEM-001",
      "produtoId": "PROD-456",
      "nome": "Coca-Cola",
      "quantidade": 2,
      "precoUnitario": 6.00,
      "subtotal": 12.00
    }
  ],
  "cortesias": [
    {
      "id": "COR-001",
      "nome": "Água Mineral",
      "quantidade": 2,
      "precoUnitario": 2.00,
      "subtotal": 4.00
    }
  ],
  "total": 51.00,
  "dataCriacao": "2024-01-15T18:30:00Z",
  "ultimaAtualizacao": "2024-01-15T18:35:00Z",
  "metodoPagamento": null, // null = pendente
  "codigoCaixa": "#12345"
}
```

#### WebSocket Events para Tempo Real:

| Evento | Direção | Descrição | Payload |
|--------|---------|-----------|---------|
| `comanda.criada` | Server → Client | Nova comanda aberta | Dados da comanda |
| `comanda.atualizada` | Server → Client | Alteração na comanda | ID, mudanças |
| `comanda.status_mudado` | Server → Client | Status alterado | ID, novo status |
| `comanda.concluida` | Server → Client | Comanda finalizada | ID, método pagamento |
| `comanda.cancelada` | Server → Client | Comanda cancelada | ID, motivo |

### 4.3 Sistema de Cardápio Dinâmico

#### Estrutura do Cardápio:

```json
{
  "categorias": [
    {
      "id": "CAT-001",
      "nome": "Bebidas",
      "ordem": 1,
      "itens": [
        {
          "id": "PROD-456",
          "nome": "Coca-Cola Lata 350ml",
          "preco": 6.00,
          "descricao": "Refrigerante cola gelada",
          "categoria": "bebidas",
          "ativo": true,
          "restricaoIdade": false
        }
      ]
    },
    {
      "id": "CAT-002",
      "nome": "Pratos Principais",
      "ordem": 2,
      "itens": [...]
    }
  ],
  "cortesias": [
    {
      "id": "COR-001",
      "nome": "Água Mineral 500ml",
      "preco": 2.00,
      "ativo": true
    }
  ]
}
```

#### Filtros e Buscas:

```javascript
const cardapioFiltrado = {
  filtroIdade: (idade) => {
    if (idade < 18) {
      return cardapio.filter(cat => 
        !cat.itens.some(item => item.restricaoIdade)
      );
    }
    return cardapio;
  },
  
  buscaPorNome: (termo) => {
    const termoLower = termo.toLowerCase();
    return cardapio.flatMap(cat => ({
      categoria: cat.nome,
      itens: cat.itens.filter(item => 
        item.nome.toLowerCase().includes(termoLower) ||
        item.descricao?.toLowerCase().includes(termoLower)
      )
    }));
  },
  
  buscaPorCategoria: (categoriaId) => {
    return cardapio.find(cat => cat.id === categoriaId);
  }
};
```

### 4.4 Sistema de Pagamento Híbrido

#### Opções de Finalização:

```javascript
const opcoesPagamento = {
  PAGAMENTO_NO_TOTEM: {
    tipos: ['cartao_credito', 'cartao_debito', 'pix'],
    fluxo: [
      'Selecionar método',
      'Inserir cartão / Ler QR Code',
      'Processar transação',
      'Confirmar sucesso'
    ],
    hardwareRequerido: ['leitor_cartao_nfc', 'camera_qrcode']
  },
  
  PAGAMENTO_NO_CAIXA: {
    fluxo: [
      'Gerar código de barras',
      'Exibir QR Code do PIX (opcional)',
      'Cliente leva ao caixa'
    ],
    hardwareRequerido: ['impressora_etiqueta']
  },
  
  PAGAMENTO_DIGITAL: {
    tipos: ['pix', 'cartao_apple_pay', 'cartao_google_pay'],
    fluxo: [
      'Gerar QR Code PIX',
      'Cliente escaneia com celular',
      'Confirmar via notificação'
    ],
    hardwareRequerido: [] // Apenas tela touch
  }
};
```

---

## 5. Funcionalidade Especial: Modo Atendimento (Sem Login)

### 5.1 Implementação Técnica

#### Estrutura de Dados para Comandas Ativas:

```javascript
const comandasAtivas = {
  cacheTTL: 300, // 5 minutos
  refreshInterval: 10000, // Atualiza a cada 10 segundos
  
  estrutura: [
    {
      "id": "CMD-12345",
      "nomeCliente": "João Silva",
      "resumo": "2 Bebidas + 1 Prato",
      "totalEstimado": 51.00,
      "status": "PEDIDO",
      "tempoAtiva": 360 // segundos
    },
    {
      "id": "CMD-12346", 
      "nomeCliente": "Maria L.",
      "resumo": "1 Bebida",
      "totalEstimado": 18.00,
      "status": "AGUARDANDO",
      "tempoAtiva": 120
    }
  ]
};
```

#### Algoritmo de Limpeza Automática:

```javascript
class SistemaComandasAtivas {
  constructor() {
    this.comandas = new Map();
    this.tempoLimiteInatividade = 300; // 5 minutos
  }
  
  registrarComanda(comanda) {
    this.comandas.set(comanda.id, {
      ...comanda,
      tempoAtiva: Date.now(),
      ultimaAcao: Date.now()
    });
    
    // Notificar clientes em tempo real
    this.emitirEvento('nova_comanda', comanda);
  }
  
  atualizarComanda(id, dados) {
    const comanda = this.comandas.get(id);
    if (comanda) {
      comanda.ultimaAcao = Date.now();
      this.emitirEvento('atualizacao_comanda', id, dados);
    }
  }
  
  limparComandasInativas() {
    const agora = Date.now();
    
    for (const [id, comanda] of this.comandas.entries()) {
      if (agora - comanda.ultimaAcao > this.tempoLimiteInatividade) {
        // Comanda inativa por muito tempo
        this.emitirEvento('comanda_expirada', id);
        this.comandas.delete(id);
        
        // Opcional: Notificar cliente via push notification
        this.enviarNotificacaoExpiracao(id, comanda.nomeCliente);
      }
    }
  }
  
  buscarComandasAtivas() {
    const agora = Date.now();
    
    return Array.from(this.comandas.values())
      .filter(comanda => 
        agora - comanda.ultimaAcao < this.tempoLimiteInatividade
      )
      .map(comanda => ({
        id: comanda.id,
        nomeCliente: comanda.nomeCliente,
        resumo: this.formatarResumo(comanda.itens),
        totalEstimado: comanda.total,
        status: comanda.status,
        tempoAtiva: Math.floor((agora - comanda.ultimaAcao) / 1000)
      }));
  }
}
```

### 5.2 Interface do Modo Atendimento

#### Tela de Comandas Ativas (Wireframe):

```
┌─────────────────────────────────────────────┐
│              MODO ATENDIMENTO               │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  COMANDAS ATIVAS - Tempo Real       │ │
│  ├──────────────────────────────────────┤ │
│  │                                     │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ João Silva                      │ │ │
│  │  │ Status: 🟡 Em Pedido            │ │ │
│  │  │ Itens: 2 Bebidas + 1 Prato      │ │ │
│  │  │ Total Estimado: R$ 51,00        │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                     │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ Maria L.                        │ │ │
│  │  │ Status: 🟢 Aguardando Pedido    │ │ │
│  │  │ Itens: 1 Bebida                │ │ │
│  │  │ Total Estimado: R$ 18,00       │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                     │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │ Carlos M.                      │ │ │
│  │  │ Status: 🟠 Em Pagamento         │ │ │
│  │  │ Itens: 3 Bebidas               │ │ │
│  │  │ Total Estimado: R$ 42,00       │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │                                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│              [Limpar Tela]                 │
└─────────────────────────────────────────────┘

Lenda: 🟢 Aguardando | 🟡 Em Pedido | 🟠 Pagamento | 🔴 Cancelado
```

### 5.3 Segurança do Modo Público

#### Mecanismos de Proteção:

1. **Timeout Automático:**
   ```javascript
   const timeoutConfig = {
     tempoInatividade: 300, // 5 minutos
     tempoBloqueioTela: 60,  // 1 minuto após inatividade
     senhaDesbloqueio: 'ADMIN2024' // Senha padrão para atendente
   };
   ```

2. **Validação de Acesso:**
   ```javascript
   class ControladorAcessoPublico {
     verificarAcesso() {
       const sessao = this.obterSessaoAtual();
       
       if (!sessao) {
         return { permitido: false, motivo: 'Sem sessão ativa' };
       }
       
       if (sessao.tipo !== 'ATENDENTE') {
         return { 
           permitido: false, 
           motivo: 'Acesso restrito a atendentes',
           requerLogin: true 
         };
       }
       
       // Verificar se está no modo público autorizado
       if (!sessao.modosAutorizados.includes('PUBLICO')) {
         return { 
           permitido: false, 
           motivo: 'Modo público desativado' 
         };
       }
       
       return { permitido: true };
     }
   }
   ```

3. **Logs de Auditoria:**
   ```javascript
   const logsAcesso = [
     {
       timestamp: new Date().toISOString(),
       usuario: 'SISTEMA',
       acao: 'ACesso_modopublico',
       detalhes: {
         ip: '192.168.1.100',
         origem: 'Tela_Inicial',
         resultado: 'PERMITIDO'
       }
     }
   ];
   ```

---

## 6. Requisitos Não-Funcionais

### 6.1 Performance

| Métrica | Objetivo | Justificativa |
|---------|----------|---------------|
| **Tempo de Carregamento** | < 2 segundos | Experiência do usuário fluida |
| **Latência WebSocket** | < 500ms | Atualização em tempo real |
| **Consumo de Memória** | < 200MB | Estabilidade prolongada |
| **Uptime** | 99.9% | Disponibilidade constante |

### 6.2 Usabilidade

- **Acessibilidade:** Suporte a leitores de tela, alto contraste
- **Tamanho de Fonte:** Mínimo 18px para legibilidade
- **Feedback Visual:** Animações suaves, confirmações claras
- **Erros:** Mensagens amigáveis com sugestões de solução

### 6.3 Segurança

```javascript
const requisitosSeguranca = {
  criptografia: 'TLS 1.3',
  autenticação: 'JWT + Refresh Tokens',
  validação: 'Sanitização de todos os inputs',
  rateLimiting: 'Máximo 50 requisições/minuto por IP',
  logs: 'Auditoria completa de todas as ações',
  backup: 'Backup automático a cada 1 hora'
};
```

---

## 7. Plano de Implementação (Roadmap)

### Fase 1: MVP - Core Funcionalidades (4-6 semanas)

```
┌─────────────────────────────────────────────────────┐
│              FASE 1 - MVP                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Login    │ │ Cardápio │ │ Comanda  │            │
│  │ Básico   │ │ Digital  │ │ Aberta   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                   │
│  ✓ Autenticação CPF + Validação Idade             │
│  ✓ Cardápio completo com filtros                   │
│  ✓ Adicionar itens e cortesias                     │
│  ✓ Resumo da comanda                               │
│  ✓ Modo Atendimento (comandas ativas)              │
└─────────────────────────────────────────────────────┘
```

### Fase 2: Pagamento e Finalização (3-4 semanas)

```
┌─────────────────────────────────────────────────────┐
│            FASE 2 - Pagamento                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Pagamento│ │ QR Code  │ │ Levar ao │            │
│  │ no Totem │ │ PIX      │ │ Caixa    │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                   │
│  ✓ Integração com leitor de cartão                 │
│  ✓ Geração QR Code PIX                             │
│  ✓ Código para caixa                               │
│  ✓ Confirmação de pagamento                        │
└─────────────────────────────────────────────────────┘
```

### Fase 3: Otimização e Escalabilidade (2-3 semanas)

```
┌─────────────────────────────────────────────────────┐
│         FASE 3 - Otimização                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Cache    │ │ WebSocket│ │ Analytics│            │
│  │ Avançado │ │ Real-time│ │ Básico   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                   │
│  ✓ Redis para cache de cardápio                    │
│  ✓ WebSocket para atualizações em tempo real       │
│  ✓ Dashboard básico de métricas                    │
└─────────────────────────────────────────────────────┘
```

---

## 8. Considerações Técnicas Adicionais

### 8.1 Banco de Dados - Schema Principal

```sql
-- Tabela de Comandas
CREATE TABLE comandas (
    id VARCHAR(50) PRIMARY KEY,
    cliente_id VARCHAR(50),
    nome_cliente VARCHAR(100),
    status ENUM('AGUARDANDO', 'PEDIDO', 'PAGAMENTO', 'CONCLUÍDO', 'CANCELADO'),
    total DECIMAL(10, 2),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metodo_pagamento VARCHAR(50),
    codigo_caixa VARCHAR(20)
);

-- Tabela de Itens da Comanda
CREATE TABLE itens_comanda (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comanda_id VARCHAR(50),
    produto_id VARCHAR(50),
    nome_produto VARCHAR(100),
    quantidade INT DEFAULT 1,
    preco_unitario DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    FOREIGN KEY (comanda_id) REFERENCES comandas(id)
);

-- Tabela de Cortesias
CREATE TABLE cortesias_comanda (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comanda_id VARCHAR(50),
    nome_cortesia VARCHAR(100),
    quantidade INT DEFAULT 1,
    preco_unitario DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    FOREIGN KEY (comanda_id) REFERENCES comandas(id)
);

-- Tabela de Histórico de Acesso
CREATE TABLE historico_acesso (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50),
    acao VARCHAR(100),
    detalhes JSON,
    ip_origem VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 API Endpoints Principais

```javascript
// Autenticação e Comandas Ativas
POST   /api/auth/login-cpf              // Login com CPF
GET    /api/comandas/ativas            // Listar comandas ativas (modo público)
DELETE /api/comanda/:id/cancelar       // Cancelar comanda

// Cardápio
GET    /api/cardapio                   // Buscar cardápio completo
GET    /api/cardapio/buscar?termo=...  // Busca por nome
GET    /api/cardapio/filtro-idade      // Filtro por idade (18+)

// Comanda e Itens
POST   /api/comanda/nova               // Criar nova comanda
PUT    /api/comanda/:id/item          // Adicionar item
DELETE /api/comanda/:id/item/:itemId  // Remover item
GET    /api/comanda/:id/resumo        // Obter resumo da comanda

// Pagamento
POST   /api/pagamento/processar       // Processar pagamento no totem
POST   /api/pagamento/qr-code         // Gerar QR Code PIX
GET    /api/comanda/:id/codigo-caixa  // Obter código para caixa
```

### 8.3 Estrutura de Pastas do Projeto

```
totem-digital/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   ├── Cardapio/
│   │   │   ├── ComandaAberta/
│   │   │   └── Pagamento/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   └── package.json
├── database/
│   ├── migrations/
│   └── seeds/
└── docs/
    ├── api.md
    └── architecture.md
```

---

## 9. Checklist de Validação

### Antes do Lançamento:

- [ ] Testar fluxo completo com diferentes perfis de usuário
- [ ] Validar performance com múltiplas comandas simultâneas
- [ ] Verificar compatibilidade com diferentes navegadores/dispositivos
- [ ] Realizar testes de segurança (injeção, XSS, etc.)
- [ ] Validar experiência em modo offline parcial
- [ ] Testar recuperação após queda de energia/internet

### Pós-Lançamento:

- [ ] Monitoramento contínuo de performance
- [ ] Coleta de feedback dos usuários finais
- [ ] Análise de logs para identificar problemas recorrentes
- [ ] Planos de manutenção e atualizações futuras

---

## 10. Conclusão

Este planejamento detalhado fornece uma base sólida para o desenvolvimento do sistema Totem Digital como comanda inteligente. As funcionalidades principais incluem:

✅ **Autenticação flexível** (CPF + Modo Atendimento)  
✅ **Cardápio dinâmico** com filtros inteligentes  
✅ **Gestão completa de comandas** em tempo real  
✅ **Pagamento híbrido** (no totem ou no caixa)  
✅ **Modo Público otimizado** para atendimento rápido  

O sistema está preparado para escalar conforme as necessidades do negócio, mantendo performance e usabilidade como prioridades centrais.