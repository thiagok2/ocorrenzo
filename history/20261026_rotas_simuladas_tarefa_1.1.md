# Diário de desenvolvimento — 26/10/2026

## Objetivo

Concluir a Tarefa 1.1 do `specs/Task.md`: ter todas as rotas do núcleo (R01 a R10) respondendo com dados simulados, no formato do `Design.md` §3, e testáveis por um arquivo `api.http` — antes de existir banco, autenticação real ou regra de negócio.

## Ponto de partida

Ao retomar o projeto, `backend/src/app.js` continha apenas a configuração inicial do Express (`cors`, `express.json()`) e duas rotas:

- `GET /api/health`, já prevista no plano.
- `GET /api/acorda-beatriz`, um teste pontual fora do escopo de `specs/Requirements.md` e `specs/Design.md`.

Ou seja, a Tarefa 1.1 ainda não estava concluída: faltavam o tratamento de erros, o agregador de rotas, as rotas simuladas R02 a R10 e o `api.http`.

## Etapa 1 — Tratamento de erros (`src/utils/ErroApp.js` e `src/middlewares/erros.js`)

Foi criada a classe `ErroApp`, que estende `Error` e carrega `status`, `codigo`, `mensagem` e `detalhes` — os campos do formato único de erro definido no Design §3.1 (RNF6):

```js
export default class ErroApp extends Error {
  constructor(status, codigo, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}
```

E o middleware de tratamento, que converte uma `ErroApp` lançada em qualquer rota na resposta JSON padronizada, e qualquer outro erro inesperado em `500 ERRO_INTERNO`:

```js
export default function tratarErros(erro, req, res, next) {
  if (erro.status) {
    return res.status(erro.status).json({ codigo: erro.codigo, mensagem: erro.message, detalhes: erro.detalhes });
  }
  console.error(erro);
  return res.status(500).json({ codigo: 'ERRO_INTERNO', mensagem: 'Erro inesperado.' });
}
```

Esses dois arquivos ainda não são usados por nenhuma rota real (as rotas desta tarefa só devolvem respostas fixas), mas já ficam no lugar certo para as tarefas 1.3 em diante, quando a validação e a autenticação de verdade passarem a lançar `ErroApp`.

## Etapa 2 — Rotas simuladas do núcleo (`src/routes/`)

Foram criados dois arquivos, seguindo a referência do `Task.md` (Tarefa 1.1), mas adaptados para a sintaxe de módulos ECMAScript (`import`/`export`) já adotada no projeto (ver `history/20261019_setup_projeto.md`):

- **`src/routes/ocorrencias.routes.js`** — rotas R04 a R08, todas com uma mesma ocorrência de exemplo:
  - `POST /` (R04) → `201` com a ocorrência criada.
  - `GET /` (R05) → lista paginada com a ocorrência de exemplo.
  - `GET /:id` (R06) → detalhe da ocorrência de exemplo.
  - `POST /:id/arquivamento` (R07) → devolve a ocorrência com `arquivada: true` e o bloco `arquivamento` (motivo vindo do corpo da requisição, autor e data/hora simulados).
  - `router.all('/:id')` (R08) → responde `405 METODO_NAO_PERMITIDO` para qualquer verbo (cobre `PUT`, `PATCH`, `DELETE`), com a mensagem exata do Design: "Ocorrências não podem ser editadas ou excluídas. Registre uma nova ocorrência ou arquive esta."

- **`src/routes/index.js`** — agrega as demais rotas do núcleo:
  - `GET /health` (R01) → `{ status: 'ok', banco: 'nao-configurado' }`.
  - `POST /auth/login` (R02) e `GET /auth/me` (R03) → usuário fixo (coordenadora "Verônica Lima") e `token: 'token-simulado'`.
  - `use('/ocorrencias', ...)` → monta o router de ocorrências.
  - `GET /alunos/:id/ocorrencias` (R09) e `GET /me/ocorrencias` (R10) → listas vazias paginadas, no formato do Design.

Nenhuma dessas rotas valida corpo, verifica token ou aplica regra de perfil ainda — isso é proposital: a Tarefa 1.1 define apenas o **contrato** da API (formato de entrada/saída e códigos HTTP do caminho feliz e do `405`). Autenticação, autorização e validação reais entram nas tarefas 1.3 e seguintes, quando essas rotas simuladas forem substituídas.

## Etapa 3 — Atualizar `src/app.js`

O `app.js` deixou de declarar rotas diretamente e passou a montar o agregador em `/api`, e a usar o middleware de erros:

```js
import express from 'express';
import cors from 'cors';
import rotas from './routes/index.js';
import tratarErros from './middlewares/erros.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', rotas);

app.use(tratarErros);

export default app;
```

A rota `GET /api/acorda-beatriz`, que não fazia parte de nenhum requisito ou rota do Design, foi removida (regra "nada fora do escopo", README e Task.md §1).

## Etapa 4 — `backend/api.http`

Foi criado `backend/api.http` com uma requisição por rota (R01 a R10), seguindo o modelo do Design §3.11, usando variáveis (`@base`, `@token`, `@ocorrenciaId`, `@alunoId`) e incluindo as duas tentativas de R08 (`PATCH` e `DELETE`) para deixar explícito o `405`.

## Etapa 5 — Teste de todas as rotas

Antes de marcar a tarefa como concluída, o servidor foi iniciado (`npm run dev`) e cada rota foi testada com `curl`, confirmando:

| Rota | Resultado |
| --- | --- |
| R01 `GET /health` | `200 { status: 'ok', banco: 'nao-configurado' }` |
| R02 `POST /auth/login` | `200` com token e usuário simulados |
| R03 `GET /auth/me` | `200` com o usuário simulado |
| R04 `POST /ocorrencias` | `201` com a ocorrência de exemplo |
| R05 `GET /ocorrencias` | `200` com lista paginada |
| R06 `GET /ocorrencias/:id` | `200` com o detalhe |
| R07 `POST /ocorrencias/:id/arquivamento` | `200` com `arquivada: true` e `arquivamento` preenchido |
| R08 `PATCH /ocorrencias/:id` | `405 METODO_NAO_PERMITIDO` |
| R08 `DELETE /ocorrencias/:id` | `405 METODO_NAO_PERMITIDO` |
| R09 `GET /alunos/:id/ocorrencias` | `200` com lista vazia e o bloco `aluno` |
| R10 `GET /me/ocorrencias` | `200` com lista vazia |

Todas as rotas responderam no formato esperado pelo Design. O checklist completo (sem token, perfil errado, entrada inválida) será repetido com sentido real a partir da Tarefa 1.3, quando autenticação e validação passarem a existir — nesta etapa, essas respostas ainda não variam, pois as rotas são simuladas.

## Etapa 6 — Instalar o PostgreSQL local e criar os bancos (início da Tarefa 1.2)

A máquina não tinha PostgreSQL instalado (`psql`/`pg_isready` ausentes). Como o projeto segue o método descrito no README — a LLM propõe o comando, o estudante executa e avalia —, os comandos foram passados para execução manual, não rodados diretamente.

**Instalação (Homebrew, Apple Silicon):**

```bash
brew install postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
brew services start postgresql@16
pg_isready
```

**Problema encontrado:** o `initdb` do Homebrew cria automaticamente um *role* com o nome do usuário do macOS (não `postgres`). Ao tentar conectar pelo DBeaver com usuário `postgres` e sem senha, o Postgres respondeu `FATAL: role "postgres" does not exist` — o role esperado pelo `.env.example` do Design (`DB_USER=postgres`) simplesmente não existia ainda.

**Solução:** criar o role `postgres` manualmente, com login, superusuário e senha definida (o estudante optou por senha fixa em vez de usar `trust`/sem senha):

```bash
psql postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"
```

A conexão com o novo usuário foi validada com:

```bash
psql -U postgres -h localhost -d postgres -W
```

**Criação dos bancos:** em vez dos nomes sugeridos como exemplo no Design §3.12 (`ocorrencia_mais` / `ocorrencia_mais_test`), foram criados com os nomes:

```bash
createdb -U postgres -h localhost ocorrenzo
createdb -U postgres -h localhost ocorrenzo_test
```

> **Nota:** `ocorrencia_mais` no Design.md é só o nome de exemplo usado no `.env.example`; o nome real do banco é uma escolha local, por isso `ocorrenzo`/`ocorrenzo_test` são igualmente válidos — o `.env` deste projeto vai refletir esses nomes reais, não o exemplo do Design.

**Resultado:** PostgreSQL 16 rodando localmente via `brew services`, usuário `postgres`/senha `postgres` (ambiente de desenvolvimento local, nunca usar essa senha em produção), bancos `ocorrenzo` e `ocorrenzo_test` criados e vazios.

## Etapa 7 — `.env`, Sequelize e conexão real com o banco (Tarefa 1.2 em andamento)

**O que foi feito:**

- Criados `backend/.env` e `backend/.env.example` (modelo do Design §3.12), com os valores reais deste ambiente: `DB_NAME=ocorrenzo`, `DB_USER=postgres`, `DB_PASS=postgres`, `DB_HOST=localhost`, `DB_PORT=5432`, `JWT_SECRET` e `JWT_EXPIRES_IN=8h`. O `.env` não é versionado (já previsto no `.gitignore`); o `.env.example` usa `DB_PASS=sua_senha` como placeholder.
- Instaladas as dependências `sequelize`, `pg`, `pg-hstore` (produção) e `sequelize-cli` (desenvolvimento).
- Criado `backend/.sequelizerc` apontando `config`, `migrations-path`, `seeders-path` e `models-path` para dentro de `src/`.
- Criados dois arquivos de configuração, porque o projeto é ESM (`"type": "module"`) mas o `sequelize-cli` exige CommonJS:
  - `src/config/database.cjs` — lido pelo `sequelize-cli` (migrations/seeders), com os ambientes `development`, `test` (banco `ocorrenzo_test`) e `production`.
  - `src/config/database.js` — versão ESM usada pela própria aplicação (`import`), com a mesma lógica de ambiente.
- Criado `src/database/connection.js`, que instancia o `Sequelize` a partir de `src/config/database.js`.
- Atualizada a rota `GET /api/health` (R01) em `src/routes/index.js`: agora chama `sequelize.authenticate()` de verdade; responde `"banco": "conectado"` se a conexão funcionar, ou `"banco": "nao-configurado"` se falhar — como pedia o passo 7 da Tarefa 1.2.

**Como testar você mesmo:**

```bash
cd backend
npm run dev
```

Em outro terminal (ou no navegador):

```bash
curl http://localhost:3333/api/health
```

**O que observar:** a resposta deve ser `{"status":"ok","banco":"conectado"}`. Se vier `"banco":"nao-configurado"`, o Postgres não está acessível com as credenciais do `.env` — confira se `brew services list` mostra o `postgresql@16` rodando e se `psql -U postgres -h localhost -d ocorrenzo -W` conecta com a senha `postgres`.

Esse teste já foi executado nesta sessão (via `curl`) e confirmou `"banco":"conectado"`.

**Observação registrada:** durante esta etapa, foi feita manualmente (pelo estudante, direto no editor) uma alteração no dado simulado de `src/routes/ocorrencias.routes.js`: o nome do aluno de exemplo passou de `"Ana Clara Silva"` para `"Ana lara Silva"`. É uma alteração intencional nos dados simulados (confirmada), não um efeito colateral desta etapa — registrando aqui para não ser confundida com uma regressão depois.

## Estado atual

- `backend/src/app.js` monta as rotas em `/api` e o middleware de erros; a rota fora de escopo foi removida.
- `backend/src/routes/index.js` e `backend/src/routes/ocorrencias.routes.js` implementam R01 a R10 com respostas simuladas; `GET /health` agora testa a conexão real com o banco.
- `backend/src/utils/ErroApp.js` e `backend/src/middlewares/erros.js` existem e estão prontos para uso pelas próximas tarefas.
- `backend/api.http` existe, com uma requisição por rota, e todas foram executadas com sucesso.
- **Tarefa 1.1 marcada como concluída em `specs/Task.md`.**
- PostgreSQL 16 instalado e rodando localmente; usuário `postgres` (senha `postgres`) criado; bancos `ocorrenzo` e `ocorrenzo_test` criados.
- `.env`/`.env.example` criados; Sequelize instalado e conectando (`GET /api/health` confirma `"banco": "conectado"`).
- Ainda faltam, para concluir a Tarefa 1.2: os modelos Sequelize (`Usuario`, `Turma`, `Aluno`, `ProfessorTurma`, `Ocorrencia`), as migrations das 5 tabelas, os triggers de imutabilidade de `ocorrencias` e os seeders de desenvolvimento.

## Etapa 8 — Modelos Sequelize, migrations e triggers de imutabilidade

**O que foi feito:**

- Criados os 5 modelos Sequelize em `src/models/` (`Usuario.js`, `Turma.js`, `Aluno.js`, `ProfessorTurma.js`, `Ocorrencia.js`), seguindo a referência do Design §3.7. `Ocorrencia.js` tem os hooks `beforeUpdate` (só deixa mudar os campos de arquivamento) e `beforeDestroy` (sempre lança erro) — é a RN1 reforçada também no nível da aplicação.
- Criado `src/models/index.js`, que instancia os 5 modelos com a conexão de `src/database/connection.js` e declara todas as associações do Design §3.7 (`Turma.hasMany(Aluno)`, `Ocorrencia.belongsTo(Aluno/Turma/Usuario)`, `Usuario.belongsToMany(Turma)` via `ProfessorTurma`, etc.).
- Criadas 6 migrations em `src/database/migrations/` (extensão `.cjs`, porque o `sequelize-cli` usa `require()` e o projeto é ESM — `.cjs` força leitura como CommonJS independente do `"type": "module"` do `package.json`):
  1. `20261026120001-criar-usuarios.cjs`
  2. `20261026120002-criar-turmas.cjs`
  3. `20261026120003-criar-alunos.cjs` (com índice em `turma_id`)
  4. `20261026120004-criar-professores-turmas.cjs` (PK composta `professor_id` + `turma_id`, sem `id` próprio)
  5. `20261026120005-criar-ocorrencias.cjs` (com os índices `(aluno_id, data_ocorrencia DESC)`, `(turma_id, data_ocorrencia DESC)` e `(arquivada)` do Design §3.6)
  6. `20261026120006-criar-triggers-ocorrencias.cjs` — os dois triggers SQL do Design §3.6: `trg_ocorrencias_sem_delete` (bloqueia qualquer `DELETE`) e `trg_ocorrencias_sem_update` (só aceita a transição ativa → arquivada; depois de arquivada, nada mais muda).
- Todas as colunas usam `snake_case` no banco (`underscored: true` nos modelos), compatível com os nomes `camelCase` dos atributos Sequelize.

**Decisão não especificada no Design/Task:** `professores_turmas` foi criada **sem** `created_at`/`updated_at` (`timestamps: false`), por ser uma tabela de associação pura (PK composta, nenhuma informação própria para auditar). As demais tabelas (`usuarios`, `turmas`, `alunos`) mantêm os timestamps padrão do Sequelize; `ocorrencias` segue exatamente o Design (`criado_em`, sem `updated_at`, porque o conteúdo é imutável).

**Como testar você mesmo:**

```bash
cd backend
npx sequelize-cli db:migrate              # banco de desenvolvimento (ocorrenzo)
npx sequelize-cli db:migrate --env test   # banco de teste (ocorrenzo_test)
```

As duas vezes devem imprimir as 6 migrations como `migrated`. Para desfazer tudo (se precisar recomeçar): `npx sequelize-cli db:migrate:undo:all` (e `--env test` para o banco de teste).

Para conferir os triggers na mão, com `psql -U postgres -h localhost -d ocorrenzo`, depois de inserir uma ocorrência de teste: um `UPDATE ocorrencias SET descricao = 'x' WHERE id = '...'` deve devolver `ERROR: Ocorrências não podem ser alteradas`, e um `DELETE FROM ocorrencias WHERE id = '...'` deve devolver `ERROR: Ocorrências não podem ser excluídas`.

**O que observar / já foi verificado nesta sessão:**

- As migrations rodaram sem erro nos dois bancos (`ocorrenzo` e `ocorrenzo_test`).
- Testado via SQL direto (`psql`): `UPDATE` de `descricao` → bloqueado pelo trigger; `DELETE` → bloqueado pelo trigger; `UPDATE` arquivando (`arquivada=true` + `motivo_arquivamento` + `arquivado_por` + `arquivado_em`) → **permitido**; um segundo `UPDATE` tentando alterar o `motivo_arquivamento` de uma ocorrência **já** arquivada → bloqueado ("Ocorrência arquivada não pode ser alterada"). Os quatro comportamentos saíram exatamente como o Design §3.6 especifica.
- **Atenção:** como consequência direta do próprio trigger, a ocorrência de teste inserida para esse experimento **não pôde ser apagada por `DELETE`** (o trigger bloqueou até o próprio teste de limpeza). Em vez de desativar o trigger, os bancos `ocorrenzo` e `ocorrenzo_test` foram zerados com `db:migrate:undo:all` seguido de `db:migrate`, para não deixar linha de teste nas tabelas. Confirmado com um script Node que carrega `src/models/index.js`, autentica e conta linhas: `Usuario`, `Turma`, `Aluno`, `ProfessorTurma` e `Ocorrencia` retornaram **0 linhas** nos dois bancos.

## Estado atual (atualizado)

- Modelos Sequelize, migrations e triggers de imutabilidade da Tarefa 1.2 estão prontos e testados nos bancos `ocorrenzo` e `ocorrenzo_test` (ambos migrados e vazios).
- `GET /api/health` continua confirmando `"banco": "conectado"`.
- **Falta, para fechar a Tarefa 1.2:** os seeders de desenvolvimento (coordenadora, professores, alunos — ver tabela do `Task.md`, Tarefa 1.2).

## Próximas etapas

1. Criar os seeders de desenvolvimento em `src/database/seeders/` com os usuários e dados de exemplo da tabela do `Task.md` (Tarefa 1.2), protegidos por `NODE_ENV` para nunca rodar em produção.
2. Depois disso, a Tarefa 1.2 estará completa e a Tarefa 1.3 (autenticação real) pode começar.

## Etapa 9 — Decisão: remover os triggers de banco (simplificar a imutabilidade)

**O que foi feito:**

Depois de ver a migration dos triggers (`20261026120006-criar-triggers-ocorrencias.cjs`), o estudante avaliou que, para o estágio atual do projeto, é complexidade desnecessária manter SQL de trigger (e o arquivo `.cjs` só para contornar o ESM) além dos hooks do Sequelize que já existem em `Ocorrencia.js`. Decisão: remover os triggers de banco e manter a imutabilidade **só** na camada da aplicação.

Passos executados:

1. Desfeita a migration dos triggers nos dois bancos, **antes** de apagar o arquivo (senão o `down()` não existiria mais para reverter): `npx sequelize-cli db:migrate:undo --name 20261026120006-criar-triggers-ocorrencias.cjs` (e `--env test`).
2. Removido o arquivo `src/database/migrations/20261026120006-criar-triggers-ocorrencias.cjs`.
3. Confirmado com `db:migrate:status` (dev e test) que restam só as 5 migrations das tabelas, todas `up`.
4. Atualizados os specs para não ficarem divergentes do código (regra do próprio projeto — os 3 arquivos precisam ser consistentes):
   - `specs/Design.md` §3.6: trocado o bloco com os dois triggers SQL por uma nota explicando a decisão (imutabilidade só via hooks, `UPDATE`/`DELETE` por SQL direto fora da API não são bloqueados).
   - `specs/Design.md` §3.7: ajustada a frase que justificava os triggers como cobertura de SQL direto.
   - `specs/Design.md` §8 (pontos em aberto): registrada a decisão, com data, e a possibilidade de reavaliar no futuro.
   - `specs/Task.md`: removido o passo 5 (migrations dos triggers) da Tarefa 1.2, renumerados os passos seguintes, adicionada uma nota da decisão; ajustado o "Pronto quando" da 1.2 (troca os dois itens de `DELETE`/`UPDATE` via SQL por um item sobre os hooks); ajustada a linha da propriedade P1 na Tarefa 1.9 (o teste deixa de testar SQL direto e passa a testar os hooks do modelo).

**Consequência a observar:** a partir de agora, um `DELETE FROM ocorrencias` ou `UPDATE ocorrencias SET descricao = 'x'` feito **direto no banco** (fora da aplicação, por exemplo via `psql` ou uma ferramenta de administração) **não é mais bloqueado** — isso é esperado e é exatamente o trade-off da decisão. A proteção continua valendo para todo o caminho da API, porque o código da aplicação só deve alterar ocorrências via `instancia.save()` (nunca `Ocorrencia.update()`/`destroy()` em massa), que é onde os hooks do Sequelize atuam.

**Como testar você mesmo:**

```bash
cd backend
npx sequelize-cli db:migrate:status           # banco ocorrenzo
npx sequelize-cli db:migrate:status --env test # banco ocorrenzo_test
```

**O que observar:** as duas listas devem mostrar só 5 migrations, todas `up` (sem a dos triggers). Isso já foi confirmado nesta sessão.

## Etapa 10 — Novos campos em Aluno/Turma e novo perfil `apoio_pedagogico` (28/10/2026)

Sessão retomada em 28/10/2026, depois do commit `1.2` e da revisão com a turma.

**O que foi pedido:** adicionar ao modelo de `Aluno` os campos `telefone`, `email`, `nomeResponsavel` e `telefoneResponsavel`; ao modelo de `Turma`, `numero`, `observacoes`, `etapaEnsino` e `turno`; e ao `perfil` de `Usuario`, um novo valor para o setor pedagógico (`apoio_pedagogico`). Também foi levantada a dúvida se não bastaria deixar a criação de tabelas por conta do `sequelize.sync()` (automático a partir do modelo), em vez de manter migrations manuais.

**Decisão sobre migrations vs. sync:** mantivemos as migrations explícitas (não usamos `sequelize.sync()`/`alter`). Motivo: é o que `Design.md` §2.2 e `Task.md` já documentam, já estava funcionando e testado, e migrations dão histórico versionado e reversível (`db:migrate:undo`) — o `sync({ alter: true })` não tem histórico, pode tomar decisões erradas em alterações ambíguas (ex.: renomear vs. apagar+criar coluna) e não serve para o trigger que já usamos antes. Para este incremento, em vez de editar as migrations já aplicadas (que alterariam o histórico de quem já migrou), foram criadas **3 migrations novas**:

- `20261028090001-adicionar-apoio-pedagogico-perfil.cjs` — `ALTER TYPE enum_usuarios_perfil ADD VALUE 'apoio_pedagogico'`. **Sem rollback real:** o Postgres não permite remover um valor de ENUM com `ALTER TYPE`; o `down()` ficou vazio, documentado no próprio arquivo.
- `20261028090002-adicionar-colunas-alunos.cjs` — adiciona `telefone`, `email`, `nome_responsavel`, `telefone_responsavel` (todas `STRING`, opcionais).
- `20261028090003-adicionar-colunas-turmas.cjs` — adiciona `numero` (`STRING`, opcional), `observacoes` (`TEXT`, opcional), `etapa_ensino` ENUM(`fundamental_1`, `fundamental_2`, `medio`) e `turno` ENUM(`matutino`, `vespertino`, `noturno`, `integral`), ambas opcionais.

Os modelos `src/models/Usuario.js`, `src/models/Aluno.js` e `src/models/Turma.js` foram atualizados com os mesmos campos (nomes em `camelCase`, mapeados para `snake_case` no banco via `underscored: true`).

**Assunções registradas (a confirmar depois):**

- `numero` da turma ficou como texto livre (`STRING(20)`), não número inteiro — por não ter certeza se é um código (ex.: "801") ou algo como "sala 203".
- Os valores de `etapaEnsino` (`fundamental_1`, `fundamental_2`, `medio`) e `turno` (`matutino`, `vespertino`, `noturno`, `integral`) foram escolhidos por serem os termos padrão de escolas brasileiras — ajustar se a escola usar outra nomenclatura.
- Todos os campos novos são opcionais (`allowNull: true`), porque não há dados existentes para migrar e porque o pedido não especificou obrigatoriedade.

**Pendência importante, não resolvida nesta etapa:** o perfil `apoio_pedagogico` existe no banco e no modelo, mas **não tem nenhuma permissão definida ainda** — nenhuma rota do Design foi alterada para aceitá-lo. Isso precisa ser decidido antes da Tarefa 1.3 (autenticação e middlewares de autorização), senão um usuário com esse perfil não vai conseguir acessar nenhuma rota protegida. Registrado como ponto em aberto em `specs/Design.md` §8, item 5.

**Como testar você mesmo:**

```bash
cd backend
npx sequelize-cli db:migrate              # banco ocorrenzo
npx sequelize-cli db:migrate --env test   # banco ocorrenzo_test
```

Esperado: as 3 novas migrations (`...090001`, `...090002`, `...090003`) aparecem como `migrated`, sem tocar nas 5 anteriores.

**O que observar / já foi verificado nesta sessão:**

- As 3 migrations novas rodaram sem erro nos dois bancos.
- Rodado um script Node carregando `src/models/index.js`: `Usuario.getAttributes().perfil.values` retornou `['professor', 'coordenador', 'aluno', 'apoio_pedagogico']`; os atributos novos de `Aluno` (`telefone`, `email`, `nomeResponsavel`, `telefoneResponsavel`) e de `Turma` (`numero`, `observacoes`, `etapaEnsino`, `turno`) apareceram corretamente nos dois modelos.
- `specs/Design.md` §3.6 atualizado com as novas colunas; §8 com o ponto em aberto das permissões do novo perfil.

## Etapa 11 — Permissões do `apoio_pedagogico` definidas

**O que foi decidido:** o perfil `apoio_pedagogico` (criado na Etapa 10) tem o **mesmo alcance do coordenador** — vê todas as turmas, sem a restrição de "só turmas vinculadas" que vale para o professor — mas é **somente leitura**: nunca registra ocorrência, nunca arquiva, nunca cadastra turma/aluno/vínculo.

**O que foi feito:** atualizado `specs/Design.md`:

- §1.3 (Personas e permissões): nova linha para o `apoio_pedagogico`.
- §3.2 (tabela geral de rotas): adicionado `apoio_pedagogico***` na coluna "Perfis" de toda rota de **leitura** que já listava professor e/ou coordenador — R05, R06, R09, R11, R12, R13, R17, R18, R20, R21. **Não** foi adicionado em nenhuma rota de escrita (R04, R07, R14, R15, R16, R19) nem em R10 (exclusiva do aluno). Nova nota de rodapé explicando o `***`.
- §8 (pontos em aberto): item 5 marcado como resolvido, com a instrução para a Tarefa 1.3 — o middleware `autorizarPerfil` vai precisar de uma variante que aceite uma lista de perfis **sem** aplicar a restrição de turma do professor (`podeAgirNaTurma`), já que o apoio pedagógico lê tudo mas não tem vínculo com turma nenhuma.

**Também corrigido nesta etapa (inconsistência encontrada, não pedida):** a RNF1 em §1.4 ainda citava "triggers de DELETE e UPDATE" — desatualizada desde a remoção dos triggers na Etapa 9. Corrigida para refletir que a proteção é só via hooks do Sequelize.

**Nada de código mudou aqui** — autenticação/autorização ainda não existem (são da Tarefa 1.3), então essa é uma decisão de especificação para quando chegarmos lá, não um teste executável agora.

**Como conferir:** ler `specs/Design.md` §1.3, a tabela de §3.2 e o item 5 de §8 — confirmar que a regra "apoio_pedagogico = leitura com alcance de coordenador" está clara e sem contradição com nenhuma outra seção.

## Pausa da sessão — revisão com a turma antes de continuar

A sessão foi pausada aqui a pedido do estudante: os seeders (item 1 das próximas etapas) **ainda não foram criados**. Antes de continuar, o estudante vai **commitar** o que está descrito neste diário (Etapas 1 a 9: rotas simuladas R01–R10, `api.http`, instalação do PostgreSQL local, `.env`/`.env.example`, modelos Sequelize, migrations, e a decisão de remover os triggers de banco em favor dos hooks do Sequelize) e **revisar com a turma**, usando este arquivo de `history/` como roteiro do que foi feito e por quê.

Ao retomar, siga a partir de "Próximas etapas" acima.
