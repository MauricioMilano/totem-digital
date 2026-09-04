---
name: validate-task
description: "Validar uma task do board do Plane (COMADIG) conferindo critérios de aceite, build/testes e o fluxo visual no navegador. Use quando: '/validate-task COMADIG-N', 'validar/confirmar a tarefa'. Se passar, move para Done; se falhar, volta para Todo com os pontos pendentes."
argument-hint: "identifier da task (ex.: COMADIG-5)"
user-invocable: true
---

# Validate Task — COMADIG (Plane)

Confere se a implementação realmente satisfaz os **Critérios de aceite** da task, em três camadas: (1) aceite item a item, (2) build/testes automatizados, (3) fluxo visual no navegador.

## Plane Context (constantes deste projeto)
- Project: `COMADIG` → id `7f692d9d-0634-4145-9024-237836c776fa`
- Estados (ids):
  - Todo `6a4eaf7d-44e9-4c77-ba54-50aac8eda916`
  - In Progress `46f51fd6-5db9-4826-b8b3-5c0acb49689f`
  - Done `3f1dcfed-37cb-4f90-99cc-a3da96540257`
- Mapeamento label → onde olhar no navegador/UI:
  - Serviços → `http://localhost:3000/totem/servicos`
  - Bebidas/Produtos → `http://localhost:3000/totem/bebidas`, `http://localhost:3000/totem/produtos`
  - Carrinho → pill inferior em qualquer tela do totem + drawer (`totem-drawer.tsx`)
  - Maioridade/Receita → `/totem/servicos` (checkbox removido) e `/totem/bebidas` (álcool oculto por padrão)
  - A11y → telas do totem; checar foco/aria/contraste

## Memória entre agentes (comentários da task)
- **Recuperar:** leia `workitem_comment list` — o resumo de execute informa o que foi tocado e onde focar a validação.
- **Preservar (obrigatório):** SEMPRE use `workitem_comment create` (prefixo `[validate-task]`) com o checklist de aceite (✅/❌ por item), resultado de lint/build e evidência visual. Se reabrir, liste as pendências para `/execute-task` retomar. Esse comentário é a memória de saída do ciclo.

## When to Use
- Após `/execute-task`, para confirmar que a task está pronta.

## Procedure
1. **Buscar a task:** `workitem retrieve_by_identifier`. Extraia os itens de `<h2>Critérios de aceite</h2>`.
2. **Camada 1 — Aceite item a item:**
   - Para cada critério, verifique no código (e/ou comportamento) se está satisfeito.
   - Marque mentalmente ✅/❌ por item.
3. **Camada 2 — Lint + build (scripts reais do projeto):**
   - `pnpm lint`.
   - `pnpm build` (Next.js faz typecheck durante o build).
   - Não há suíte de testes dedicada; não invente `pnpm test`.
   - Registre falhas com o erro exato.
4. **Camada 3 — Navegador (fluxo visual):**
   - Garanta que o dev server está no ar (`http://localhost:3000`). Se não estiver, inicie `pnpm dev` em background.
   - Use as browser tools para navegar ao caminho da label e **confessar o critério na tela real** (ex.: clicar nos chips de categoria, adicionar item via stepper, checar se a pill cobre os botões).
   - Capture o estado relevante (snapshot) como evidência quando útil.
5. **Decisão:**
   - **Tudo ✅ + build ok** → `workitem update` com `state` = Done (`3f1dcfed-...`) e comente o resultado (obrigatório, prefixo `[validate-task]`).
   - **Qualquer ❌** → `workitem update` com `state` = Todo (`6a4eaf7d-...`) e atualize a descrição adicionando uma seção `<h2>Pendências de validação</h2>` listando os itens que falharam, para `/execute-task` retomar.
6. **Reportar** ao usuário: tabela/checklist dos critérios (passou/falhou), resultado do build/testes, evidência visual e o estado final da task no Plane.
7. **Condição final:** se a task foi movida para Done, o ciclo de validação está completo. Ofereça de fazer commit do resultado com `git-commit-diff` (opcionalmente com mensagem de commit), já previamente aprovado.

## Regras
- Só marca **Done** quando TODOS os critérios passam E o typecheck/testes estão verdes.
- Não "corrija" código aqui — esta skill valida. Se algo falhar, documente e devolva para execução.
- Seja objetivo: evidência concreta (trecho de tela, output do build) em vez de "deve estar ok".
