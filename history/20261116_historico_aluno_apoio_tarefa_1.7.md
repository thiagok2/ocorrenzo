# Diário de desenvolvimento — 16/11/2026

# Tarefa 1.7 — Histórico do aluno, visão do aluno e leituras de apoio

## Objetivo

Essa tarefa junta duas coisas: terminar o núcleo (R09 — histórico de um aluno visto por professor/coordenador; R10 — "meu histórico", a visão do próprio aluno) e abrir as primeiras rotas de **apoio** (R11 — listar turmas; R12 — listar alunos com contadores; R13 — ficha de um aluno). É a primeira tarefa em que o perfil `aluno` realmente lê dados (até aqui ele só aparecia nas checagens de escopo do R06).

## O que foi criado

| Arquivo | Papel |
| --- | --- |
| `src/services/escopo.service.js` | novo `podeVerAluno(usuario, aluno)`: aluno só vê o próprio (`aluno.usuarioId === usuario.id`); professor vê se a turma **atual** do aluno é vinculada **ou** se existe alguma ocorrência dele numa turma vinculada (caso do aluno transferido); coordenador/apoio_pedagogico sempre veem |
| `src/validators/ocorrencia.validator.js` | filtros de período (`situacao`, `tipo`, `gravidade`, `dataInicio/Fim`, `page/pageSize`) extraídos pra `filtrosOcorrencia`, reaproveitados por `esquemaListagem` (R05) e pelo novo `esquemaHistoricoAluno` (R09/R10, sem `q`/`turmaId` — o aluno já vem do path ou do token) |
| `src/validators/aluno.validator.js` | novo arquivo: `esquemaListagemAlunos` (R12) — `q`, `turmaId`, `page`, `pageSize` |
| `src/services/ocorrencia.service.js` | filtro de período extraído pra `montarFiltroPeriodo()` (reaproveitado por `listar`, R05); nova função privada `montarHistorico()` (monta a resposta `{ aluno, itens, total, page, pageSize }`) usada por `historicoAluno()` (R09, checa `podeVerAluno`) e `meuHistorico()` (R10, busca o aluno pelo `usuarioId` do token) |
| `src/services/aluno.service.js` | novo arquivo: `listar()` (R12 — paginação + busca `iLike` + contadores agregados por aluno) e `detalhar()` (R13 — `resumo` com `totalAtivas`, `graves`, `arquivadas`, `ultimaOcorrenciaEm`, escopado por turma pra professor) |
| `src/services/turma.service.js` | novo arquivo: `listar()` (R11 — `turmasPermitidas` decide se filtra ou devolve todas) |
| `src/controllers/{ocorrencia,aluno,turma}.controller.js` | `historicoAluno`/`meuHistorico` (reaproveitam `serializarOcorrencia`); `aluno.controller.listar`/`detalhar`; `turma.controller.listar` |
| `src/routes/alunos.routes.js`, `src/routes/turmas.routes.js` | novos routers: `/alunos` (R09, R12, R13) e `/turmas` (R11) |
| `src/routes/index.js` | monta os dois novos routers; `GET /me/ocorrencias` (R10) trocado pelo handler real, com `autorizarPerfil('aluno')` |
| `api.http` | cenários reais de R09 a R13 |

## Por que `podeVerAluno` ficou no `escopo.service.js`, e não duplicado em cada service

R09 (histórico por professor/coordenador) e R13 (ficha do aluno) precisam exatamente da mesma regra de acesso — "turma atual vinculada OU ocorrência registrada em turma vinculada" — então ficou num lugar só, ao lado de `turmasPermitidas`/`podeAgirNaTurma`, que já são os outros dois pontos de decisão de escopo do projeto.

## Dois bugs encontrados e corrigidos no caminho

### 1. Mensagem de erro errada pra aluno em R09/R13

Quando um aluno tentava ver o histórico/ficha de **outro** aluno, a resposta `403` dizia "Acesso restrito às turmas em que você leciona." — uma frase que só faz sentido pra professor. Corrigido em `ocorrencia.service.js` (R09) e `aluno.service.js` (R13): a mensagem agora depende do perfil (`'Acesso restrito ao próprio histórico.'` pra aluno).

### 2. `col()` do Sequelize não traduz nome de atributo pra nome de coluna

Em `aluno.service.js` (R12), o cálculo de `ultimaOcorrenciaEm` usava `fn('MAX', col('dataOcorrencia'))` — e isso devolvia `500 ERRO_INTERNO`, porque `col()` manda o identificador **literal** pro SQL, sem passar pelo mapeamento `underscored: true` do modelo (diferente de `attributes: [...]`, que traduz automaticamente). A coluna real no Postgres é `data_ocorrencia`. Corrigido trocando pro nome real da coluna: `col('data_ocorrencia')`.

**Lição prática:** `attributes`/`where` no Sequelize conhecem os nomes de atributo do modelo (`dataOcorrencia`) e traduzem pra coluna; já `col()` e SQL bruto (`literal()`, `fn()` com coluna solta) **não** — ali o nome tem que ser o da coluna de verdade no banco.

## Como testar você mesmo

Com o servidor no ar, os cenários abaixo estão no `api.http` atualizado:

- **R09:** coordenador vendo o histórico de Alana (200, com `turmaAtual`); a própria Alana vendo o próprio (200); outra aluna tentando ver o de Alana (403); id inexistente (404).
- **R10:** aluno em `/me/ocorrencias` (200); coordenador na mesma rota (403 — rota é só pra perfil aluno).
- **R11:** coordenador listando turmas (200, só "3º Ano" no seed); aluno tentando (403).
- **R12:** listar alunos sem filtro (200, 22 no total); busca por nome e por matrícula; aluno tentando (403).
- **R13:** ficha de Alana pelo coordenador e por ela mesma (200, com `resumo`); outra aluna tentando (403); id inexistente (404).

## O que observar

- O `resumo` de R13 pra Alana mostra `totalAtivas: 3`, `arquivadas: 1` — bate com o que foi feito nas Tarefas 1.4–1.6 (4 ocorrências registradas nela ao longo dos testes, 1 arquivada na 1.6).
- Um aluno sem nenhuma ocorrência aparece em R12 com `totalOcorrenciasAtivas: 0` e `ultimaOcorrenciaEm: null` (testado com Enzo Gabriel).
- A parte "depois de transferir um aluno, o histórico antigo continua mostrando a turma original" (critério de R09) só é testável de fato depois da Tarefa 1.8 (transferência de turma) — por ora a lógica de `turmaId` imutável na ocorrência (RN5) já é garantida desde a 1.4, só falta o cenário de transferência pra observar na prática.

## Próximo passo

Confirmar os testes acima e marcar a Tarefa 1.7 como concluída em `specs/Task.md`; seguir para a Tarefa 1.8 — cadastros: turmas, alunos, vínculos e transferência (R14 a R19). É nessa tarefa que o critério de transferência de R09 finalmente fica demonstrável.

## Confirmação dos testes (16/11/2026)

Todos os cenários de R09 a R13 confirmados via curl: histórico do aluno por coordenador/titular/outro aluno (403)/inexistente (404); `/me/ocorrencias` (200 pro aluno, 403 pro coordenador); listagem de turmas (200/403); listagem de alunos com busca por nome e matrícula, e contadores corretos (incluindo caso de aluno sem ocorrências: `0`/`null`); ficha do aluno com `resumo`. Os dois critérios que dependem de transferência de aluno (Tarefa 1.8, ainda não implementada) ficaram marcados como pendentes no `Task.md`, com a lógica de escopo já implementada e comprovada nas tarefas anteriores. **Tarefa 1.7 concluída.** Próximo: Tarefa 1.8 (cadastros e transferência).
