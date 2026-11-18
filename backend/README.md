# Ocorrência+ — Backend

API Node.js (Express, módulos ES) + PostgreSQL + Sequelize. Implementa o núcleo (R01 a R19) e o painel complementar (R20, R21) do sistema — ver `specs/Design.md` §3. O frontend consome esta API a partir de `frontend/`; a API continua testável isoladamente pelo `api.http` (Postman/curl) e pela suíte automatizada (`npm test`).

## Pré-requisitos

- Node.js 22 LTS (ou compatível)
- PostgreSQL rodando localmente (ou acessível pela rede)

## 1. Instalar as dependências

```bash
cd backend
npm install
```

## 2. Configurar o `.env`

```bash
cp .env.example .env
```

Edite `.env` com as credenciais do seu PostgreSQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`) e troque `JWT_SECRET` por um valor próprio. `DB_NAME` é o nome-base do banco — o banco de desenvolvimento usa esse nome direto; o de teste usa `<DB_NAME>_test` automaticamente (ver `src/config/database.js`).

## 3. Criar os bancos de dados

```bash
createdb ocorrenzo          # banco de desenvolvimento (ajuste se DB_NAME for diferente no seu .env)
createdb ocorrenzo_test     # banco usado por `npm test` — nunca é usado pela API em execução normal
```

## 4. Migrar e semear

```bash
# banco de desenvolvimento
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# banco de teste (mesmas migrations e seed, mas em ocorrenzo_test)
NODE_ENV=test npx sequelize-cli db:migrate
NODE_ENV=test npx sequelize-cli db:seed:all
```

O seed (`src/database/seeders/20261104090001-dev-turma-unica-e-pessoas.cjs`) é só para desenvolvimento/teste — recusa rodar se `NODE_ENV=production`. Ele cria:

- 1 coordenador, 3 professores (todos vinculados à mesma turma) e 2 apoio pedagógico;
- 1 turma ("3º Ano") com 22 alunos reais, cada um com login próprio.

**Usuários de teste** — a senha de todos é `senha123`:

| Perfil | Nome | Matrícula |
| --- | --- | --- |
| coordenador | Marcio Roberio | `2026000001` |
| professor | Thiago Oliveira | `2026000002` |
| professor | Osvaldo Pife | `2026000003` |
| professor | Marici Lopes | `2026000004` |
| apoio_pedagogico | Fabricia | `2026000005` |
| aluno (exemplo) | Alana Sofia Mendonça Ribeiro Trajano | `2024308532` |

## 5. Subir a API

```bash
npm run dev     # com reinício automático (nodemon)
# ou
npm start       # sem reinício automático
```

A API fica em `http://localhost:3333/api` (ou na porta definida em `PORT`). Confirme com:

```bash
curl http://localhost:3333/api/health
```

## 6. Testar as rotas

Com o servidor no ar, abra `api.http` (extensão REST Client do VS Code, ou equivalente no Postman/Insomnia/Thunder Client) e rode as requisições em ordem — o arquivo cobre as 21 rotas (R01 a R21), caminho feliz e os erros esperados de cada uma.

## 7. Rodar a suíte automatizada

```bash
npm test
```

Roda contra o banco `ocorrenzo_test` (passo 4 acima precisa já ter sido feito). Cobre as 6 propriedades de corretude do Design (P1 a P5 — imutabilidade, escopo por turma, turma preservada na transferência, arquivamento auditado, visão do aluno — mais P6, o destaque recalculado do painel) mais os casos gerais de autenticação/validação. Pode ser rodada repetidamente sem resetar o banco — cada execução cria suas próprias turmas/alunos com nomes únicos.

## Estrutura

```
src/
  app.js, server.js        → bootstrap do Express
  config/, database/        → configuração do Sequelize, migrations e seeders
  models/                   → Usuario, Turma, Aluno, ProfessorTurma, Ocorrencia
  routes/, controllers/      → uma dupla por recurso (ocorrencias, alunos, turmas, professores, auth)
  services/                  → regras de negócio (escopo por turma, registrar/listar/arquivar ocorrência, cadastros)
  validators/                 → esquemas Joi por recurso
  middlewares/                → autenticar (JWT), autorizarPerfil, validar, tratarErros
tests/                      → Jest + Supertest, um arquivo por propriedade de corretude (P1-P5) + geral
```

Mais detalhes de cada decisão — e o porquê — estão em `../history/` (um arquivo por sessão de desenvolvimento) e em `../specs/Design.md`.
