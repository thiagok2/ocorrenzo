# 2026-11-18 — Tarefa 3.1: Backend do painel simples (R20, R21)

## Contexto

Com a Tarefa 2.11 liberada (testes automatizados do frontend verdes; roteiro manual completo fica para o usuário rodar de uma vez), a Fase 3 — complementar — foi autorizada a começar. Esta é a primeira tarefa fora do núcleo: as duas rotas que alimentam o painel do coordenador (R20 e R21), implementadas exatamente como no `Design.md` original (não há mudança de escopo desde a Tarefa 1.10 — nenhuma rota de R20/R21 existia antes).

## O que foi feito

- `src/validators/painel.validator.js`: `periodoDias` restrito a `{30, 60, 90}` (padrão 30) nas duas rotas; `turmaId` opcional em R21.
- `src/services/painel.service.js`: `turmas()` (R20) e `alunosEmAtencao()` (R21).
- `src/controllers/painel.controller.js` e `src/routes/painel.routes.js`, montada em `/api/painel` (`src/routes/index.js`).
- `backend/api.http`: 7 novas requisições (painel por turma em 30/90 dias, `periodoDias` inválido, acesso de professor negado, alunos em atenção com e sem filtro de turma).
- `backend/tests/p6-painel.test.js`: cobre a propriedade P6 do Design (§5) — 2 graves não destaca, a 3ª destaca, arquivar remove do destaque, 5 `destaque_positivo` não destacam, 5 ativas quaisquer destacam por `totalAtivas`, soma correta por turma, e `403` para professor.
- `backend/README.md` atualizado (R01–R19 → R01–R21; menção ao frontend que agora existe).

## Arquitetura e escolhas

- **Restrito a coordenador e apoio_pedagogico, não só coordenador**: o `Tasks.md` (Tarefa 3.1, passo 3) diz só "Restringir ao coordenador", mas o `Design.md` (§3.2, linha 274–275, e a nota de resolução do perfil `apoio_pedagogico` em §8) é explícito: R20 e R21 têm os mesmos perfis de leitura que R05/R06/R09/R11/R12/R13/R17/R18 — coordenador **e** apoio_pedagogico (somente leitura, sem restrição de turma). Segui o `Design.md`, que é a fonte mais detalhada e já tinha essa decisão registrada; `autorizarPerfil('coordenador', 'apoio_pedagogico')` nas duas rotas, igual ao padrão já usado nas outras rotas de leitura ampla.
- **R20 conta a turma pela turma registrada na ocorrência (RN5), nunca pela turma atual do aluno** — mesma regra de sempre: um aluno transferido não "leva" sua ocorrência antiga para a nova turma nas estatísticas. A consulta agrupa direto por `Ocorrencia.turmaId`.
- **R21 conta o aluno sobre o histórico inteiro dele (qualquer turma em que a ocorrência foi registrada)**, igual ao `resumo` de `GET /alunos/:id` (R13) para coordenador/apoio — já que `turmasPermitidas` devolve `null` (sem restrição) pra esses dois perfis, não tem porque agrupar por `Ocorrencia.turmaId` aqui. O parâmetro `turmaId` da rota filtra **quais alunos aparecem na lista** (pela turma **atual** deles, `Aluno.turmaId`) — não filtra as ocorrências contadas. É a mesma lógica usada em `GET /alunos` (R12): "me mostra os alunos desta turma", não "me mostra só as ocorrências registradas nesta turma".
- **Nenhuma rota devolve zero turmas/zero alunos por falta de ocorrência**: R20 sempre lista **todas** as turmas (mesmo sem nenhuma ocorrência no período, aparecem com `totalAtivas: 0`), porque o painel é "visão de todas as turmas da escola", não só as que tiveram problema.
- **Teste criando turma/aluno fixo por teste** (`novoAluno()` com sufixo único a cada `it`), em vez de reaproveitar os alunos fixos do seed: a lógica de "em atenção" soma **todo** o histórico ativo do aluno no período, então reutilizar um aluno do seed (que pode já ter ocorrências de outros testes/sessões anteriores) tornaria os números imprevisíveis. Criar um aluno novo a cada cenário garante que cada `it` comece do zero.

## O que observar

```bash
cd /Users/thiagooliveira/desenv/workspace/ifal/ocorrenzo/ocorrenzo/backend
npm test
```
Deve mostrar `7 passed, 7 total` suítes / `23 passed, 23 total` testes (os 17 de antes + os 6 novos de P6). Com o servidor no ar, testar manualmente em `api.http` as 7 requisições novas no final do arquivo (seção R20/R21): painel por turma com 30 e 90 dias, `periodoDias=45` → `400`, professor → `403` nas duas rotas, alunos em atenção com e sem `turmaId`.

## Próximo passo

Tarefa 3.2 — Frontend: `PainelPage`.
