---
name: execute-task
description: "Executar uma task do board do Plane (COMADIG) editando o código de verdade. Use quando: '/execute-task COMADIG-N', 'executar/implementar a tarefa'. Move para In Progress, implementa os passos no repositório, roda build/testes e deixa pronto para /validate-task."
argument-hint: "identifier da task (ex.: COMADIG-5)"
user-invocable: true
---

# Execute Task — COMADIG (Plane)

Implementa a task de verdade no repositório: lê o escopo, edita os arquivos, roda build/testes e atualiza o estado no Plane.

## Plane Context (constantes deste projeto)
- Project: `COMADIG` → id `7f692d9d-0634-4145-9024-237836c776fa`
- Estados (ids):
  - Backlog `a8bb837f-6fd1-46e0-9438-33b08fc8fd8c`
  - Todo `6a4eaf7d-44e9-4c77-ba54-50aac8eda916`
  - In Progress `46f51fd6-5db9-4826-b8b3-5c0acb49689f`
  - Done `3f1dcfed-37cb-4f90-99cc-a3da96540257`
  - Cancelled `b5d209aa-02d5-4c39-810a-4aa70ea5fed9`
- Mapeamento label → caminhos prováveis (confirme lendo o código):
  - Serviços → `src/app/totem/servicos/**`, `src/app/api/servicos/**`
  - Bebidas/Produtos → `src/app/totem/bebidas/**`, `src/app/totem/produtos/**`, `src/app/api/cardapio/**`
  - Carrinho → `src/components/totem/totem-drawer.tsx`, `src/hooks/use-comanda.ts`, `src/app/totem/page.tsx`
  - Maioridade/Receita → `src/app/totem/servicos/**`, `src/app/totem/bebidas/**`, `src/app/admin/**`, `src/lib/**`
  - A11y → `src/components/totem/**`, `src/components/shared/**`, `src/app/totem/**`

## Memória entre agentes (comentários da task)
- **Recuperar:** ao começar, leia `workitem_comment list` — decisões de refine/validate anteriores e pendências definem como executar.
- **Preservar:** ao terminar a implementação, use `workitem_comment create` (prefixo `[execute-task]`) com: arquivos alterados, resultado de lint/build, o que fica para `/validate-task` conferir e qualquer ressalva.

## When to Use
- Usuário quer que você implemente o código de uma task já escopada.

## Procedure
1. **Buscar a task:** `workitem retrieve_by_identifier`. Leia nome, labels, prioridade e descrição (Escopo + Critérios de aceite).
2. **Mover para In Progress:** `workitem update` com `state` = `46f51fd6-5db9-4826-b8b3-5c0acb49689f`.
3. **Ler o código antes de tocar.** Abra os arquivos do escopo (label→caminho + inferência). Entenda o contexto real; não edite às cegas.
4. **Implementar passo a passo** seguindo o `<h2>Escopo</h2>`:
   - Edições cirúrgicas com `replace_string_in_file` / `multi_replace_string_in_file`.
   - Se o escopo exigir arquivos novos, migração Prisma (`prisma/schema.prisma`) ou mudança em API, faça junto.
   - Mantenha consistência com o design system (classes tailwind existentes) e com o padrão das outras telas do totem.
5. **Verificar erros:** rode `get_errors` nos arquivos tocados. Se houver TypeScript/lint, corrija antes de seguir.
6. **Verificação (scripts reais do projeto — ver `package.json`):**
   - Lint: `pnpm lint`.
   - Typecheck/build: `pnpm build` (Next.js roda o typecheck durante o build).
   - Não há suíte de testes dedicada neste projeto; não invente `pnpm test`.
   - Se o dev server já está no ar, prefira validar pelo navegador em vez de rodar `build` completo a cada passo.
7. **Reportar** ao usuário: o que mudou (arquivos), resultado do typecheck/testes, e o próximo passo → rodar `/validate-task COMADIG-N`.
   - **Não marcar como Done aqui.** A validação é responsabilidade de `/validate-task`.

## Regras
- Se o escopo estiver ambíguo ou divergir do código, PARE e sugira `/refine-task` antes de continuar.
- Não comite/mova para Done sem a validação passar.
- Prefira mudanças mínimas e idiomáticas ao padrão do projeto (Next.js + Prisma + Tailwind).
