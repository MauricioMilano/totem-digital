---
name: refine-task
description: "Refinar uma task existente no board do Plane (COMADIG) cruzando o escopo com o código atual. Use quando: '/refine-task COMADIG-N', 'refinar/atualizar a tarefa', ou quando o código mudou e a descrição da task ficou desatualizada. Atualiza Escopo + Critérios de aceite com base nos arquivos reais."
argument-hint: "identifier da task (ex.: COMADIG-5)"
user-invocable: true
---

# Refine Task — COMADIG (Plane)

Reabre uma task, compara o que ela descreve com o estado **atual** do código e reescreve Escopo + Critérios de aceite para refletir a realidade.

## Plane Context (constantes deste projeto)
- Project: `COMADIG` → id `7f692d9d-0634-4145-9024-237836c776fa`
- Mapeamento label → caminhos prováveis (confirme lendo o código):
  - Serviços → `src/app/totem/servicos/**`, `src/app/api/servicos/**`
  - Bebidas/Produtos → `src/app/totem/bebidas/**`, `src/app/totem/produtos/**`, `src/app/api/cardapio/**`
  - Carrinho → `src/components/totem/totem-drawer.tsx`, `src/hooks/use-comanda.ts`, `src/app/totem/page.tsx`
  - Maioridade/Receita → `src/app/totem/servicos/**`, `src/app/totem/bebidas/**`, `src/app/admin/**`, `src/lib/**`
  - A11y → `src/components/totem/**`, `src/components/shared/**`, `src/app/totem/**`

## Memória entre agentes (comentários da task)
O thread guarda as decisões dos agentes anteriores — é sua memória de entrada.
- **Recuperar:** antes de refinar, leia todo o histórico com `workitem_comment list` e considere decisões/premissas registradas por create/execute/validate.
- **Preservar:** após atualizar a descrição, use `workitem_comment create` (prefixo `[refine-task]`) explicando O QUE mudou no escopo e POR QUÊ (ex.: "arquivo X renomeado; critério Y ajustado para...").

## When to Use
- Antes de executar uma task, para garantir que o escopo ainda bate com o código.
- Quando a task ficou parada e o código evoluiu por baixo dela.

## Procedure
1. **Buscar a task** pelo identifier: `workitem retrieve_by_identifier` (ex.: `COMADIG-5`). Anote `id`, `name`, `labels`, `priority`, `state` e a descrição atual.
2. **Ler o código atual.** Pelos caminhos da label + inferindo pela descrição, abra os arquivos envolvidos com `read_file`/`grep_search`. Entenda como está AGORA (não pelo que a task assume).
3. **Diagnosticar divergências** entre a descrição e a realidade:
   - Arquivos que mudaram de nome/localização.
   - Passos do escopo já feitos ou que deixam de fazer sentido.
   - Critérios de aceite que ficaram imprecisos.
4. **Grill user**: Faça quantas perguntas seja necessario se não tiver nada claro, Não invente, se houver dúvidas sobre o que a task deveria fazer, pergunte antes de atualizar. Não invente comportamento. use a tool `vsCode.askQuestion`.
5. **Reescrever a descrição** em HTML com as mesmas seções (contexto + `<h2>Escopo</h2>` + `<h2>Critérios de aceite</h2>`), corrigindo caminhos e passos. Mantenha o que continua válido.
6. **Atualizar** com `workitem update` (`project_id`, `workitem_id`, novo `description_html`; ajuste `labels`/`priority` se necessário). Passe apenas os campos que mudam.
7. **Reportar** as mudanças: o que estava desatualizado, o que foi corrigido e o estado atual da task. Se a task for impossível/inválida agora, sugira cancelar (`state` → Cancelled) em vez de refinar.

## Qualidade
- Nunca invente comportamento — todo passo do escopo deve corresponder a algo verificável no código.
- Se não tiver certeza de um ponto, pergunte antes de gravar.
