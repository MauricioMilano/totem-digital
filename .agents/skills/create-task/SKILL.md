---
name: create-task
description: "Criar uma task no board do Plane (projeto COMADIG) a partir de um pedido/bug/descoberta. Use quando: '/create-task', 'criar tarefa', 'abrir issue/task no Plane', ou ao descobrir um problema no código que vira trabalho. Analisa os arquivos do projeto para escopar e gera uma task com Escopo + Critérios de aceite."
argument-hint: "descrição da tarefa (ex.: zerar carrinho no novo pedido)"
user-invocable: true
---

# Create Task — COMADIG (Plane)

Cria um work item no projeto **COMADIG** do Plane, escopado com base nos arquivos reais do repositório.

## Plane Context (constantes deste projeto)
- Project: `COMADIG` → id `7f692d9d-0634-4145-9024-237836c776fa`
- Labels existentes (use as mais próximas; se nenhuma servir, crie uma):
  - Serviços `6020f82b-cb17-4d3a-84dc-42a5d63c6101`
  - Bebidas/Produtos `5368e61f-7cef-4bfb-b791-78220c9e213c`
  - Carrinho `4fc5c2c3-b647-4b2f-971f-2e5337299107`
  - Maioridade/Receita `f390b6af-fbf5-4295-b70c-1d3ea1b827ef`
  - A11y `4a0191b1-3066-4e09-a4a4-f912faa6026c`
- Mapeamento label → caminhos prováveis (dica para escopo; confirme lendo o código):
  - Serviços → `src/app/totem/servicos/**`, `src/app/api/servicos/**`
  - Bebidas/Produtos → `src/app/totem/bebidas/**`, `src/app/totem/produtos/**`, `src/app/api/cardapio/**`
  - Carrinho → `src/components/totem/totem-drawer.tsx`, `src/hooks/use-comanda.ts`, `src/app/totem/page.tsx`
  - Maioridade/Receita → `src/app/totem/servicos/**`, `src/app/totem/bebidas/**`, `src/app/admin/**`, `src/lib/**`
  - A11y → `src/components/totem/**`, `src/components/shared/**`, `src/app/totem/**`

## Memória entre agentes (comentários da task)
Os comentários do thread são a memória compartilhada entre `/refine-task`, `/execute-task` e `/validate-task`. A criação inicia essa trilha.
- **Preservar:** após criar o work item, use `workitem_comment create` com um resumo estruturado (prefixo `[create-task]`): decisão de escopo, arquivos considerados (caminhos) e premissas/hipóteses assumidas.

## When to Use
- Usuário pede para virar tarefa/issue algo que encontrou.
- Você descobriu um bug ou melhoria durante o trabalho e deve registrá-la no board.

## Procedure
1. **Entender o pedido.** Se a descrição for vaga (não fica claro o resultado desejado), faça 1–3 perguntas objetivas antes de continuar. Não invente escopo.
2. **Localizar os arquivos.** A partir do mapeamento label→caminho acima, abra/leia os arquivos relevantes para entender como funciona hoje (use `grep_search`/`read_file`). Identifique onde a mudança entra.
3. **Escolher label e prioridade:**
   - Label: a mais próxima da área; se for uma área nova, crie o label com `label create`.
   - Prioridade: `urgent` (bloqueia fluxo), `high` (importante, próximo ciclo), `medium`, `low`.
4. **Redigir a descrição** em HTML simples, SEMPRE com estas seções:
   - Parágrafo curto: o problema/contexto e onde está no código (caminhos de arquivo).
   - `<h2>Escopo</h2>` + `<ul>` com os passos concretos de implementação.
   - `<h2>Critérios de aceite</h2>` + `<ul>` verificável (como saber que funcionou).
5. **Criar o work item** com `workitem create`:
   - `project_id` = `7f692d9d-0634-4145-9024-237836c776fa`
   - `name` = `[Label] resumo curto em imperativo` (ex.: `[Carrinho] Zerar carrinho no Novo Pedido`)
   - `labels`, `priority`, `description_html` conforme acima.
   - Não passe `type_id` (usa o tipo padrão do projeto).
6. **Confirmar** ao usuário: identifier criado (COMADIG-N), label, prioridade e um resumo da descrição.

## Qualidade
- Título: imperativo, específico, com prefixo `[Label]`.
- Escopo citando arquivos reais (não genérico).
- Critérios de aceite testáveis (ideia: `/validate-task` vai conferir exatamente esses itens).
