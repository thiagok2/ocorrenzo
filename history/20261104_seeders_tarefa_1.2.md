# Diário de desenvolvimento — 04/11/2026

## Objetivo

Fechar o único item pendente da Tarefa 1.2 (`specs/Task.md`): os seeders de desenvolvimento. Modelos, migrations e hooks de imutabilidade já estavam prontos desde a sessão de 26/10 — faltava só popular o banco com dados de teste.

## Ponto de partida

A sessão anterior (`history/20261026_rotas_simuladas_tarefa_1.1.md`, seção "Pausa da sessão") tinha sido parada propositalmente antes de criar os seeders, para o estudante revisar o progresso com a turma. `backend/src/database/seeders/` não existia.

## Etapa 1 — Dados reais em vez dos fictícios do Task.md

Em vez dos nomes de exemplo do `Task.md` (Verônica Lima, Prof. Marcos Andrade etc.), o estudante passou dados reais de uma única turma do 3º ano do Ensino Médio: 22 alunos (nome + matrícula), além de si mesmo (Thiago Oliveira) e outros dois professores fictícios (Osvaldo Pife, Marici Lopes), um coordenador (Marcio Roberio) e duas pessoas de apoio pedagógico (Fabricia, Lidiane).

`specs/Task.md` (seção "Dados de desenvolvimento" da Tarefa 1.2) foi atualizado para refletir esses dados reais, em vez dos fictícios — mantendo a regra do projeto de que os specs não podem divergir do que o código realmente faz.

**Assunção registrada:** a lista de alunos não trazia nome nem turno da turma. Perguntado ao estudante, ficou definido o nome `3º Ano`; o turno ficou em branco (campo `turno` é opcional no modelo `Turma`, pode ser preenchido depois).

## Etapa 2 — Seeder único (`20261104090001-dev-turma-unica-e-pessoas.cjs`)

Criado `backend/src/database/seeders/20261104090001-dev-turma-unica-e-pessoas.cjs`, no mesmo formato `.cjs` das migrations (projeto é ESM, `sequelize-cli` precisa de CommonJS). Ele:

1. Recusa rodar se `NODE_ENV=production` (exigência do Task.md §1.2).
2. Gera um hash único de `senha123` com `bcryptjs` e usa esse mesmo hash para **todos** os usuários (coordenador, 3 professores, 2 pessoas de apoio pedagógico, 22 alunos) — assim todo mundo loga com a mesma senha nesta fase de desenvolvimento.
3. Cria a turma `3º Ano` (etapa `medio`), os 6 usuários da equipe (`usuarios` com os perfis `coordenador`, `professor` e `apoio_pedagogico`), o vínculo dos 3 professores com a turma (`professores_turmas`) e, por fim, os 22 alunos — cada um com seu próprio registro em `usuarios` (perfil `aluno`) ligado ao registro em `alunos` via `usuario_id`.
4. `down()` desfaz tudo na ordem inversa (`alunos` → `professores_turmas` → `usuarios` → `turmas`).

Os UUIDs são gerados com `crypto.randomUUID()` (nativo do Node, sem dependência nova) e guardados em variáveis para linkar `turma_id`, `usuario_id` e `professor_id` entre as inserções.

**Dependência nova:** o projeto ainda não tinha `bcryptjs` instalado (só estava citado como referência no `Task.md`, nunca de fato `npm install`ado). Pedido ao estudante rodar a instalação ele mesmo (convenção do projeto).

## Como testar você mesmo

```bash
cd backend
npm install bcryptjs
npx sequelize-cli db:seed:all                 # banco ocorrenzo
npx sequelize-cli db:seed:all --env test      # banco ocorrenzo_test (se for usar nos testes)
```

## O que observar

- Os dois comandos de seed devem terminar sem erro, com log `== 20261104090001-dev-turma-unica-e-pessoas: migrated`.
- `SELECT nome, matricula, perfil FROM usuarios;` deve trazer 1 coordenador, 3 professores, 2 apoio_pedagogico e 22 alunos (28 linhas).
- `SELECT nome FROM turmas;` deve trazer só `3º Ano`.
- `SELECT * FROM professores_turmas;` deve trazer 3 linhas (Thiago, Osvaldo e Marici, todos ligados à mesma turma).
- `SELECT a.nome, a.matricula, t.nome FROM alunos a JOIN turmas t ON t.id = a.turma_id;` deve trazer os 22 alunos, todos na turma `3º Ano`.
- Rodar de novo sem `db:seed:undo` antes deve **falhar** com erro de `matricula` ou `nome` duplicado (os campos são `UNIQUE`) — isso é esperado, não é bug.
- `npx sequelize-cli db:seed:undo:all` deve remover as 28 linhas de `usuarios`, as 22 de `alunos`, as 3 de `professores_turmas` e a 1 de `turmas`, sem erro.

## Etapa 3 — Confirmação e fechamento da Tarefa 1.2

Estudante confirmou que rodou `npm install bcryptjs` e `npx sequelize-cli db:seed:all` e os dados foram carregados sem erro.

Marcado em `specs/Task.md`: checkbox principal da Tarefa 1.2, título com "✅ CONCLUÍDA" (mesmo padrão da Tarefa 1.1) e os 4 itens de "Pronto quando". Também corrigida uma inconsistência antiga: a linha-resumo da Tarefa 1.2 na seção 2 ainda citava "trigger", mas os triggers de banco foram removidos na Etapa 9 da sessão de 26/10 — agora diz só "modelos, migrations e seeds".

## Próximo passo

Tarefa 1.3 — Autenticação real e middlewares (R02, R03): troca do login/`/auth/me` simulados por `bcrypt.compare` + JWT de verdade, e os middlewares `autenticar` e `autorizarPerfil` (este último precisa da variante "sem restrição de turma" para o `apoio_pedagogico`, pendência já registrada em `specs/Design.md` §8).

> Continua em `history/20261104_autenticacao_tarefa_1.3.md`.
