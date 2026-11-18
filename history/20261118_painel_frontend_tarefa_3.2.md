# 2026-11-18 — Tarefa 3.2: Frontend — `PainelPage`

## O que foi feito

- `src/hooks/usePainelTurmas.js` (R20) e `usePainelAlunosEmAtencao.js` (R21).
- `src/pages/painel/`: `PainelPage.jsx`, `PeriodoSelect.jsx`, `TurmaCard.jsx`, `SeverityBar.jsx`, `AlunosEmAtencaoList.jsx`.
- Aba **Painel** adicionada ao `AppHeader` (só coordenador) e rota `/painel` registrada no `App.jsx`, protegida por `perfis={['coordenador']}` (o mesmo bloco de proteção de `/cadastros`).

## Arquitetura e escolhas

- **Acesso só do coordenador no frontend, mesmo a API aceitando `apoio_pedagogico`**: a Tarefa 3.1 liberou `GET /painel/*` pros dois perfis (seguindo o `Design.md` §3.2), mas o mapa de abas do `Design.md` §4.1 só lista **"coordenador — Ocorrências · Cadastros (+ Painel na fase 3)"** — nenhuma aba de Painel para `apoio_pedagogico`. A própria Tarefa 3.2 confirma isso no "Pronto quando": "respeita... o acesso só do coordenador". Por isso a aba e a rota ficaram restritas a coordenador na interface, mesmo a API aceitando mais um perfil — a tela é mais restrita que a API, nunca o contrário (o que seria inseguro).
- **`periodoDias` na URL** (`?periodoDias=30|60|90`), igual ao padrão já usado nos filtros das outras páginas — dá pra recarregar ou compartilhar o link mantendo o período escolhido.
- **`SeverityBar`**: barra única dividida em até 3 segmentos (grave · média · leve, nessa ordem visual, da mais grave pra mais leve) com largura proporcional ao total da turma; quando a turma não tem nenhuma ocorrência ativa no período, mostra uma barra cinza vazia em vez de dividir por zero.
- **Sem KPIs, "por categoria" ou "exportar relatório"**: o Design (§7, mapa Figma → escopo) já descarta esses elementos da tela original do Figma para a versão simplificada da Fase 3 — só `TurmaCard`s e a lista de alunos em atenção, como a Tarefa 3.2 pede.
- **Dois `useState`/hooks independentes** (`usePainelTurmas` e `usePainelAlunosEmAtencao`) em vez de um hook só: são duas chamadas de API diferentes (R20 e R21), cada uma com seu próprio estado de carregamento/erro — útil porque um card de turma pode terminar de carregar antes (ou depois) da lista de alunos em atenção, e cada seção mostra seu próprio esqueleto/erro sem travar a outra.
- **Tela inicial continua sendo Ocorrências**: `ROTA_INICIAL_POR_PERFIL` (Tarefa 2.3) não foi tocado — login do coordenador continua caindo em `/ocorrencias`, nunca em `/painel`, exatamente como o "Pronto quando" desta tarefa exige.

## O que observar

Depende do backend da Tarefa 3.1 (`npm test` em `backend/` verde) e de haver ocorrências cadastradas para gerar números. Roteiro sugerido, logado como coordenador: abrir a aba **Painel**; trocar o período (30/60/90 dias) e ver os cards de turma e a lista de atenção mudarem juntos; clicar em **Ver ocorrências da turma** de um card → vai para `/ocorrencias?turmaId=...` já filtrado; clicar no nome de um aluno na lista "Precisa de atenção" → vai para a ficha dele (`/alunos/:id`). Logado como professor ou aluno, confirmar que não existe a aba "Painel" e que digitar `/painel` na URL redireciona para fora.

## Próximo passo

Com a Fase 3 concluída, falta só a **Tarefa 4.1 — Fechamento** (README da raiz, roteiro de demonstração, revisão final dos 3 arquivos de spec).
