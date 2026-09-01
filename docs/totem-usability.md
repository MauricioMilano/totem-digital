# Mapeamento de Usabilidade — Totem

Análise de usabilidade do fluxo de autoatendimento (`/totem`). Foco em três
perguntas:

1. Quais páginas têm botão de voltar e quais não têm (ou têm de forma errada)?
2. Quais pontos podem deixar o usuário perdido?
3. Quais melhorias de usabilidade são recomendadas?

Baseado na leitura de todas as páginas, componentes e hooks do totem.

---

## 1. Mapa de Navegação (botões de voltar)

Esta é a tabela central para responder "quais páginas têm botão de voltar".

| Página | Rota | Botão no topo | Botão no rodapé | Destino real |
|--------|------|---------------|-----------------|--------------|
| Início (escolha) | `/totem` | — | — | — (é o início) |
| Início (identificação) | `/totem` (step) | **"Voltar para o início"** (←) | — | `/totem` |
| Serviços | `/totem/servicos` | **"Trocar CPF"** (←) ⚠️ | **"Voltar"** | `/totem` (remove a sessão) |
| Bebidas | `/totem/bebidas` | **"Voltar aos serviços"** (←) | **"Voltar"** | `/totem/servicos` |
| Produtos | `/totem/produtos` | **"Voltar às bebidas"** (←) | **"Voltar"** | `/totem/bebidas` |
| Resumo | `/totem/resumo` | **"Voltar aos produtos"** (←) | **"Adicionar mais itens"** | `/totem/produtos` |
| Pagamento | `/totem/pagamento` | **NENHUM** ❌ | **"Voltar para Resumo"** ⚠️ | `/totem/minha-comanda` |
| Sucesso | `/totem/sucesso` | — | **"Nova Comanda"** | `/totem` (ok) |
| Novo cliente | `/totem/novo-cliente` | **"Voltar"** (←) | **"Cancelar"** | `/totem` |
| Minha comanda | `/totem/minha-comanda` | **NENHUM** ⚠️ | **"Voltar para Início"** | `/totem` |
| Comandas ativas | `/totem/comandas` | **"Voltar"** (←) | — | `/totem` |

### Legenda
- ✅ Padrão: botão de voltar no topo **e** no rodapé.
- ⚠️ **Problema de usabilidade** (ver detalhes abaixo).
- ❌ **Falta botão de voltar** para o fluxo.

---

## 2. Páginas com problemas de navegação (destaque)

### 2.1 Pagamento — sem botão de voltar real (mais crítico)

`src/app/totem/pagamento/page.tsx`

- **Não há botão de voltar no cabeçalho.** O usuário que chegou de
  `/totem/resumo` fica sem um caminho claro de "voltar".
- O único botão de retorno é **"Voltar para Resumo"**, mas ele leva a
  `/totem/minha-comanda` (resumo da comanda *do cliente*), não à página de
  `/totem/resumo` (onde o pedido está sendo montado). O nome **mente** sobre o
  destino.
- **Risco:** o usuário quer revisar/itens antes de pagar, clica em "Voltar para
  Resumo" e cai na tela errada, sem perceber que perdeu o fluxo de montagem.
- **Sugestão:** adicionar um botão "Voltar" no topo levando a `/totem/resumo`.
  Renomear "Voltar para Resumo" para "Voltar minha comanda" ou corrigir o
  destino.

### 2.2 Serviços — "Trocar CPF" se parece com botão de voltar

`src/app/totem/servicos/page.tsx`

- O cabeçalho mostra um ícone de **seta para a esquerda (←)** ao lado de
  **"Trocar CPF"**. O ícone diz "voltar", mas a ação **remove a sessão** e volta
  ao início (não é um "voltar ao passo anterior").
- Isso conflita com o botão **"Voltar"** do rodapé (que também vai ao início).
- **Risco:** o usuário clica esperansando voltar ao passo anterior e, de
  surpresa, é desconectado e precisa informar o CPF de novo.
- **Sugestão:** trocar o ícone do "Trocar CPF" (usar ícone de usuário/refresh,
  não seta de voltar) ou renomear para "Trocar cliente". Remover a seta para
  evitar a leitura de "voltar".

### 2.3 Minha comanda — sem botão de topo

`src/app/totem/minha-comanda/page.tsx`

- Não há header com seta de voltar. O usuário só pode voltar via rodapé
  ("Voltar para Início").
- **Não é grave**, mas quebra o padrão visual das demais telas (todas têm
  cabeçalho com seta). A consistência ajuda o usuário a saber "onde estou".
- **Sugestão:** adicionar um cabeçalho simples com seta → `/totem`.

---

## 3. Pontos onde o usuário pode ficar perdido

### 3.1 Sem indicador de progresso / etapas
Não há nenhum **stepper** ou barra de progresso (Serviços → Bebidas → Produtos →
Resumo → Pagamento). A única indicação de "etapa atual" é o texto do botão de
voltar ("Voltar aos serviços", etc.).

- **Risco:** o usuário não sabe em que ponto do fluxo está nem quantos passos
  restam. Em um quiosque, isso gera insegurança ("é só isso? donde volvo?").
- **Sugestão:** um stepper no topo (ex.: `Serviços › Bebidas › Produtos › Resumo`)
  destacando a etapa atual.

### 3.2 Checkbox "Maioridade" é um gate invisível
Em `/totem/servicos` existe o checkbox **"Tenho mais de 18 anos..."**, que
libera bebidas alcólicas na etapa seguinte.

- **Risco:** o usuário que quer pedir uma bebida alcólica não sabe que precisa
  marcar isso. Só na página de bebidas aparece o texto
  *"(após verificar maioridade)"*, que pode passar despercebido.
- **Sugestão:** adicionar um aviso logo abaixo do checkbox: *"Marque para ver as
  bebidas alcólicas."* Ou, melhor, mover/fixar a verificação de maioridade como
  um passo explícito.

### 3.3 Duas formas de "conta aberta" sem clara separação
- Início → **"Minha Conta"** → lista comandas ativas → escolhe uma →
  `/totem/minha-comanda` (apenas **visualiza**).
- Início → **Novo Pedido** com CPF de cliente com conta aberta → modal
  **"Conta em Aberto"** → **"Adicionar Itens à Conta Existente"**.

- **Risco:** o usuário pode não entender a diferença entre "consultar meu
  consumo" e "adicionar à minha conta". O modal ajuda, mas o card "Minha Conta"
  não deixa claro que é apenas consulta.
- **Sugestão:** renomear o card para **"Consultar minha comanda"** (só leitura)
  vs. o fluxo de adição já está claro pelo modal.

### 3.4 Quantidade não persiste entre idas e vindas
As quantities de bebidas/produtos ficam em estado local da página
(`quantidades`). O item só entra no carrinho ao clicar em **"Continuar"** /
**"Revisar Pedido"**.

- **Risco:** o usuário aumenta a quantidade de uma bebida, volta ao passo
  anterior e, ao retornar, a quantidade **zerou** (só foi adicionada ao carrinho
  ao confirmar).
- **Sugestão:** persistir as quantitàades no carrinho (`use-comanda`) já na
  interação, ou avisar que só será adicionado ao confirmar.

### 3.5 Sem feedback de "item adicionado" em todos os passos
`addItem` dispara um toast (`toast.success`), o que é bom, mas os passos de
bebidas/produtos usam +/- visualmente sem confirmar o acionamento no carrinho
até o "Continuar". O usuário pode não ter certeza de que o + registrou algo.

- **Sugestão:** feedback visual imediato (ex.: badge de quantidade no card) ou
  manter o toast, garantindo que ele apareça em cada interação.

### 3.6 Página de sucesso sem caminho de "voltar" explícito
`/totem/sucesso` mostra apenas **"Nova Comanda"** (que reinicia). Isso é
**adequado** (é o fim do fluxo), mas o usuário que quer apenas **visualizar a
comanda paga** não tem onde ir.

- **Sugestão:** oferecer também um link "Ver comprovante / detalhes da comanda".

---

## 4. Desequilíbrios de consistência (padrão visual)

| Aspecto | Com padrão | Sem padrão | Impacto |
|---------|-----------|-----------|---------|
| Cabeçalho com seta de voltar | servicos, bebidas, produtos, resumo, novo-cliente, comandas | pagamento, minha-comanda | Usuário espera seta no topo e não encontra |
| Botão "Voltar" no rodapé | servicos, bebidas, produtos, minha-comanda | pagamento (só "Voltar para Resumo") | Pagamento é a tela mais "sem saída" |
| Tela de loading | servicos, bebidas, produtos, pagamento, minha-comanda | resumo | Resumo carrega inline (sem skeleton) |
| Estado vazio | bebidas, produtos, resumo, comandas | pagamento (forma de pagamento) | Sem forma de pagamento → tela confusa |

---

## 7. Alterações aplicadas (usabilidade)

> Implementadas reaproveitando o design-system existente, sem dependências novas.

1. **Nova `src/components/shared/flow-stepper.tsx`** — stepper de etapas reutilizável
   nas páginas do fluxo.
2. **Pagamento** (`pagamento/page.tsx`): adicionado botão **"Voltar ao pedido"**
   no topo → `/totem/resumo`; o botão **"Voltar ao pedido"** do rodapé agora
   leva a `/totem/resumo` (antes `/totem/minha-comanda`); stepper (etapa 5/5).
3. **Minha comanda** (`minha-comanda/page.tsx`): adicionado botão **Voltar**
   (seta ←) no topo → `/totem`.
4. **Serviços** (`servicos/page.tsx`): "Trocar CPF" agora é **"Trocar cliente"**
   com ícone de usuário (não seta de voltar); stepper (etapa 1/5); aviso abaixo
   do checkbox de maioridade explicando o gate.
5. **Bebidas / Produtos / Resumo**: adicionado stepper (etapas 2/3/4 respectivamente)
   abaixo do botão de voltar já existente.

> Observação: o card **"Minha Conta"** da página inicial já possui a descrição
> *"Consulte seu consumo ou finalize o pagamento"*, que deixa claro seu caráter
> de consulta, portanto não foi necessário renomeá-lo.

> Implementadas reaproveitando o design-system existente, sem dependências novas.

1. **Nova `src/components/shared/flow-stepper.tsx`** — stepper de etapas reutilizável
   nas páginas do fluxo.
2. **Pagamento** (`pagamento/page.tsx`): adicionado botão **"Voltar ao pedido"**
   no topo → `/totem/resumo`; o botão **"Voltar ao pedido"** do rodapé agora
   leva a `/totem/resumo` (antes `/totem/minha-comanda`); stepper (etapa 5/5).
3. **Minha comanda** (`minha-comanda/page.tsx`): adicionado botão **Voltar**
   (seta ←) no topo → `/totem`.
4. **Serviços** (`servicos/page.tsx`): "Trocar CPF" agora é **"Trocar cliente"**
   com ícone de usuário (não seta de voltar); stepper (etapa 1/5); aviso abaixo
   do checkbox de maioridade explicando o gate.
5. **Bebidas / Produtos / Resumo**: adicionado stepper (etapas 2/3/4 respectivamente)
   abaixo do botão de voltar já existente.

> Observação: o card **"Minha Conta"** da página inicial já possui a descrição
> *"Consulte seu consumo ou finalize o pagamento"*, que deixa claro seu caráter
> de consulta, portanto não foi necessário renomeá-lo.

1. **Pagamento: adicionar botão "Voltar" no topo → `/totem/resumo`** e corrigir
   o destino/nome de "Voltar para Resumo". *(Mais crítico — tela sem saída real.)*
2. **Adicionar um stepper de etapas** no topo do fluxo (Serviços → Bebidas →
   Produtos → Resumo → Pagamento). *(Redeza geral de "ficar perdido".)*
3. **"Trocar CPF" em serviços: trocar ícone/seta** para não simular "voltar".
4. **Verificação de maioridade mais explícita** (aviso ou passo fixado).
5. **Consistenciar cabeçalhos** (minha-comanda e pagamento com seta no topo).
6. **Persistir quantities** no carrinho entre idas e vindas.
7. **Renomear card "Minha Conta" → "Consultar minha comanda**" (só leitura) para
   separar claramente de "adicionar à conta".
8. **Estado de "sem forma de pagamento"** na tela de pagamento.
9. **Oferecer "ver detalhes/comprou"** na página de sucesso.

---

## 6. Resumo executivo

- **Páginas bem navegadas:** bebidas, produtos, resumo, novo-cliente, comandas.
- **Páginas frágeis:** **pagamento** (sem voltar real + nome enganoso) e
  **minha-comanda** (sem seta de topo).
- **Maior fonte de confusão:** ausência de indicador de etapas + "Trocar CPF"
  com ícone de voltar + gate de maioridade invisível.
- **Prioridade 0:** consertar a navegação da tela de pagamento.
