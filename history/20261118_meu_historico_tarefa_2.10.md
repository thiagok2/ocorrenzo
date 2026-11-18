# 2026-11-18 — Tarefa 2.10: `MeuHistoricoPage` (perfil aluno)

## O que foi feito

- `src/hooks/useMeuHistorico.js` (R10, `GET /me/ocorrencias`).
- `src/pages/historico/MeuHistoricoPage.jsx` e `HistoricoTable.jsx`.
- Rota `/meu-historico` deixou de ser placeholder.
- Removido `src/pages/PlaceholderPage.jsx`: depois desta tarefa, nenhuma rota do mapa usa mais placeholder — todas as 6 páginas da Fase 2 (login, ocorrências, alunos, ficha, cadastros, meu histórico) já existem de verdade.

## Arquitetura e escolhas

- **Tabela própria (`HistoricoTable`), não a `OcorrenciasTable` reaproveitada**: o Design pede colunas diferentes aqui — **Data · Tipo · Gravidade · Descrição · Situação** (nessa ordem, tipo e descrição em colunas separadas, sem coluna de turma) — enquanto a `OcorrenciasTable` das Tarefas 2.5/2.8 combina tipo+descrição numa coluna e tem uma coluna de aluno/turma. Dar mais uma prop a `OcorrenciasTable` para cobrir esse terceiro layout deixaria o componente genérico demais para o que vale a pena; uma tabela pequena e só de leitura, dedicada a esta página, ficou mais simples de ler.
- **Sem menu de ações**: a tabela inteira é só leitura — clicar em qualquer linha abre o `OcorrenciaDetalheDialog` (reaproveitado das Tarefas 2.6/2.7). Não há `RowActionsMenu`: Design explicitly diz "sem menu de ações" para esta página, e um aluno nunca pode arquivar nem registrar correção mesmo que tentasse pela API direto (o backend já bloqueia isso desde a Tarefa 1.3/1.6 — `autorizarPerfil`).
- **Filtros reaproveitados**: `SituacaoTabs` e `FiltrosTipoGravidadePeriodo` (extraídos na Tarefa 2.8) são os mesmos componentes da `OcorrenciasPage`/`FichaAlunoPage` — o aluno filtra por tipo, gravidade e período exatamente como professor/coordenador, só que sem o filtro de aluno (óbvio, é sempre ele mesmo) nem de turma.
- **Nenhuma ação de registrar/arquivar na tela**: nem o botão nem o drawer de registro aparecem aqui — a Tarefa 1.3 já bloqueia `POST /ocorrencias` para o perfil aluno no backend (`403`), então não tem sentido oferecer isso na interface.

## O que observar

Depende de login como aluno. Roteiro sugerido: logar com uma matrícula de aluno (senha = a própria matrícula) e confirmar que cai direto em "Meu histórico"; o cabeçalho deve mostrar só a aba "Meu histórico" (sem Ocorrências/Alunos/Cadastros); a lista deve mostrar só as ocorrências do próprio aluno; filtrar por tipo/gravidade/período e trocar de aba (Ativas/Arquivadas/Todas) deve funcionar; clicar numa linha abre o detalhe, sem nenhuma opção de editar/arquivar; digitar `/ocorrencias` ou `/cadastros` na URL deve redirecionar para fora dessas páginas.

## Próximo passo

Tarefa 2.11 — Testes do frontend, roteiro ponta a ponta e ajustes. **Com ela, o núcleo (Req. 1 a 6) fica entregue.**
