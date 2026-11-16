# Diário de desenvolvimento — 16/11/2026

# Tarefa 1.8 — Cadastros: turmas, alunos, vínculos e transferência

## Objetivo

Até aqui, toda turma e todo aluno vinham só do seed de desenvolvimento — não havia como o coordenador criar uma turma nova, cadastrar um aluno, transferir alguém de turma ou vincular um professor. A Tarefa 1.8 fecha essa base mínima (R14 a R19), **toda restrita ao perfil coordenador**. É também a primeira tarefa em que dá pra testar de ponta a ponta duas regras que só existiam "no papel" até agora: RN5 (turma preservada na ocorrência) e o efeito imediato do vínculo professor-turma.

## O que foi criado

| Arquivo | Papel |
| --- | --- |
| `src/validators/turma.validator.js` | novo arquivo: `esquemaCriarTurma` (`nome`, 1–30) |
| `src/validators/professor.validator.js` | novo arquivo: `esquemaVincularProfessor` (`professorId`, UUID) |
| `src/validators/aluno.validator.js` | `esquemaCriarAluno` (`nome`, `matricula`, `turmaId`) e `esquemaTransferirAluno` (`turmaId`) |
| `src/services/turma.service.js` | `criar(nome)` — `409` se já existe turma com esse nome |
| `src/services/aluno.service.js` | `criar({ nome, matricula, turmaId })` — cria `Usuario` (perfil `aluno`, senha inicial = matrícula, hash via bcrypt) e `Aluno` **na mesma transação** (`sequelize.transaction`); `transferir(id, turmaId)` — só troca `alunos.turma_id`, não toca em nenhuma ocorrência existente |
| `src/services/professor.service.js` | novo arquivo: `listar()` (R17), `listarPorTurma(turmaId)` (R18, via association `turma.professores`), `vincular(turmaId, professorId)` (R19, `409` se já vinculado) |
| `src/controllers/{turma,aluno,professor}.controller.js` | `criar`/`transferir`/`listar`/`vincular` |
| `src/routes/turmas.routes.js` | `POST /` (R14), `GET /:id/professores` (R18), `POST /:id/professores` (R19) |
| `src/routes/alunos.routes.js` | `POST /` (R15), `PATCH /:id/turma` (R16) |
| `src/routes/professores.routes.js` | novo arquivo: `GET /` (R17) |
| `api.http` | cenários reais de R14 a R19, incluindo o roteiro completo de RN5 e do vínculo imediato |

Todas as rotas de escrita (R14, R15, R16, R19) usam só `autorizarPerfil('coordenador')` — sem checagem de escopo por turma, porque cadastro é atribuição exclusiva do coordenador (Design §3.4). R17/R18 (leitura) seguem o padrão já usado em R11/R12: `coordenador` e `apoio_pedagogico`.

## Por que `criar` do aluno precisa de transação

`POST /alunos` cria **dois** registros que precisam nascer juntos: o `Usuario` (acesso de login, perfil `aluno`) e o `Aluno` (dados escolares, com `usuarioId` apontando pro usuário recém-criado). Se o processo caísse entre os dois `INSERT`s (erro de rede, falha do banco), ficaria um `Usuario` "aluno fantasma" sem registro em `alunos`, ou vice-versa. `sequelize.transaction(async (t) => {...})` garante que os dois `INSERT`s só são confirmados juntos — se qualquer um falhar, os dois são desfeitos (`ROLLBACK` automático).

## O teste mais importante da tarefa: RN5 de ponta a ponta

Esse era o critério que ficava pendente desde a Tarefa 1.4 (não dava pra transferir ninguém, então não dava pra comprovar que a ocorrência preserva a turma antiga). Agora dá:

1. Cria um aluno numa turma nova ("9º B").
2. Registra uma ocorrência pra ele — a ocorrência grava `turma_id` = "9º B" (a turma dele **naquele momento**).
3. Transfere o aluno pra "3º Ano" (`PATCH /alunos/:id/turma`).
4. Consulta a ocorrência de novo (`GET /ocorrencias/:id`) → continua mostrando `turma: "9º B"`, mesmo com o aluno já estando em "3º Ano" agora.
5. Consulta a ficha do aluno (`GET /alunos/:id`, R13) → `turma` (atual) já mostra "3º Ano".

Isso também resolveu, como efeito colateral, a limitação de seed registrada desde a Tarefa 1.4 ("professor sem vínculo → 403" não era testável porque só existia uma turma): com `POST /turmas` (R14) e `POST /turmas/:id/professores` (R19), agora dá pra criar uma segunda turma e comprovar os dois lados — um professor sem vínculo recebe `403` ao tentar registrar nela, e o mesmo professor, depois de vinculado via R19, consegue registrar **imediatamente**, sem precisar de nada mais.

## Como testar você mesmo

Com o servidor no ar, o roteiro completo está no `api.http` (seção R14 a R19) — rodando em ordem, cada passo usa variáveis capturadas da resposta do passo anterior (`@turmaNovaId`, `@alunoNovoId`, `@ocorrenciaRN5Id`, `@professorId`), igual ao padrão já usado desde a Tarefa 1.3 pro `@token`.

## O que observar

- `RateLimit` do login: o roteiro de R14-R19 faz vários logins (coordenador, professor, aluno novo) — se for repetir os testes várias vezes seguidas, pode bater no limite de 10/15min (mesmo comportamento documentado na Tarefa 1.3). Reiniciar o servidor zera o contador.
- O aluno criado por R15 loga de primeira com a própria matrícula como senha — é a mesma regra usada no seed (Tarefa 1.2), só que agora disponível via API.

## Próximo passo

Confirmar os testes acima e marcar a Tarefa 1.8 como concluída em `specs/Task.md`. Com isso, **a Fase 1 (núcleo do backend) está no fim** — falta só a Tarefa 1.9 (testes automatizados com Jest + Supertest, inclusive os casos que dependiam de "professor sem vínculo" e que agora têm dados reais pra cobrir) e a 1.10 (checkpoint que libera o frontend).

## Confirmação dos testes (16/11/2026)

Todos os cenários confirmados via curl: R14 (criar turma, nome duplicado 409, professor 403), R15 (criar aluno com acesso, matrícula duplicada 409, turma inexistente 404, professor 403, login do novo aluno com senha = matrícula), R16 (transferir, mesma turma 409, professor 403), R17/R18/R19 (listar professores, listar vinculados, vincular, par duplicado 409, professor 403 nos três). O teste de RN5 de ponta a ponta funcionou: ocorrência registrada na turma "9º B" manteve essa turma depois da transferência do aluno pra "3º Ano", e a professora vinculada a "9º B" (Marici Lopes) conseguiu arquivar essa ocorrência pela turma **registrada**, enquanto um professor sem vínculo com "9º B" (Osvaldo Pife) recebeu `403` na mesma tentativa. Isso também resolveu a pendência de "professor sem vínculo" das Tarefas 1.4 a 1.7, que ficou registrada como confirmada no `Task.md`. **Tarefa 1.8 concluída — Fase 1 (núcleo do backend) encerrada.** Próximo: Tarefa 1.9 (testes automatizados).
