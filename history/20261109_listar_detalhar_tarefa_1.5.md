# Diário de desenvolvimento — 09/11/2026

# Tarefa 1.5 — Listar e detalhar ocorrências

## Objetivo

`GET /api/ocorrencias` (R05) e `GET /api/ocorrencias/:id` (R06) deixam de ser simuladas. R05 ganha filtros (situação, busca por aluno, turma, tipo, gravidade, período) e paginação; R06 passa a checar quem pode ver o quê — inclusive o **aluno**, que só pode ver a própria ocorrência (titular), caso que não existia nas rotas anteriores (R04 e R07 não têm perfil `aluno`).

## Peças criadas/alteradas

| Arquivo | O que mudou |
| --- | --- |
| `src/services/escopo.service.js` | `turmasPermitidas` agora trata `apoio_pedagogico` igual a `coordenador` (`null` = todas as turmas) — pendência registrada desde a Tarefa 1.3 (Design §8, item 5), resolvida aqui porque R05/R06 são as primeiras rotas de leitura que usam o escopo |
| `src/validators/ocorrencia.validator.js` | novo `esquemaListagem` (query): `situacao`, `q`, `turmaId`, `tipo`, `gravidade`, `dataInicio`/`dataFim`, `page`/`pageSize` (máx. 50) |
| `src/services/ocorrencia.service.js` | `listar(usuario, query)` (escopo por `turmaId IN permitidas`, busca `iLike` em nome/matrícula do aluno, `findAndCountAll` ordenado por `dataOcorrencia DESC, criadoEm DESC`) e `detalhar(usuario, id)` (404 se não existe; para `aluno`, 403 se não for o titular — comparando `aluno.usuarioId` com o `id` do token; para os demais perfis, usa `podeAgirNaTurma`) |
| `src/controllers/ocorrencia.controller.js` | `formatarOcorrencia` renomeado para `serializarOcorrencia` (exportado) — é o formatador único pedido pelo passo 5 da tarefa, reaproveitado por `registrar`, `listar` e `detalhar` |
| `src/routes/ocorrencias.routes.js` | `GET /` com `autorizarPerfil('professor', 'coordenador', 'apoio_pedagogico')` (aluno não lista, só vê o próprio histórico — isso é a Tarefa 1.7/R10); `GET /:id` **sem** `autorizarPerfil` — qualquer perfil autenticado chega no controller, e o service decide o acesso (por isso o comentário "escopo resolvido no service", igual à referência do Design §3.9) |
| `api.http` | cenários reais de R05 (padrão, filtros combinados, busca por nome, aluno recebendo 403) e R06 (dono vendo a própria ocorrência, outro aluno recebendo 403, inexistente) |

## Dois bugs encontrados e corrigidos no caminho

### 1. `req.query` é somente leitura no Express 5

`middlewares/validar.js` fazia `req[origem] = value` depois de validar com Joi — funcionava para `body` (Tarefa 1.3), mas `GET /ocorrencias` devolvia `500 ERRO_INTERNO`. Causa: no Express 5, `req.query` é uma propriedade só com *getter* (sem *setter*); como o projeto usa ESM (sempre em *strict mode*), a atribuição direta lança `TypeError: Cannot set property query of #<IncomingMessage> which has only a getter` — isso nunca apareceu antes porque nenhuma rota validava `query` até agora.

**Correção** em `middlewares/validar.js`:
```js
if (origem === 'query') {
  Object.defineProperty(req, 'query', { value, writable: true, configurable: true, enumerable: true });
} else {
  req[origem] = value;
}
```

### 2. Data voltava um dia (fuso horário)

Registrar com `"data": "2026-05-12"` gravava e devolvia `"2026-05-11"`. Causa: `Joi.date()` converte a string ISO num `Date` de meia-noite **UTC**; esse `Date` ia direto pro Sequelize (`dataOcorrencia`, coluna `DATEONLY`), que formata o valor usando os componentes **locais** do `Date` — em fuso UTC-3 (horário de Maceió), meia-noite UTC de 12/05 é 21h do dia 11/05 local, então a coluna gravava "2026-05-11".

**Correção** em `ocorrencia.validator.js`: depois de validar com `.max('now')` (que precisa do `Date` de verdade pra comparar), um `.custom()` devolve a string `YYYY-MM-DD` extraída com `toISOString().slice(0, 10)` — sempre em UTC, nunca passando por conversão de fuso local. Mesmo tratamento em `dataInicio`/`dataFim` do `esquemaListagem`, pelo mesmo motivo.

**Lição prática:** `Joi.date()` + colunas `DATEONLY` do Sequelize é uma combinação arriscada em qualquer fuso diferente de UTC — o ponto seguro é nunca deixar um objeto `Date` chegar a uma coluna `DATEONLY`; sempre convertê-lo pra string antes.

## Como testar você mesmo

Com o servidor no ar, os cenários abaixo estão no `api.http` atualizado; em `curl`:

```bash
TOKEN=$(curl -s -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" -d '{"matricula":"2026000001","senha":"senha123"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0,"utf8")).token')

# R05 - padrão (só ativas, mais recente primeiro)
curl -s http://localhost:3333/api/ocorrencias -H "Authorization: Bearer $TOKEN"

# R05 - busca por nome
curl -s "http://localhost:3333/api/ocorrencias?q=Alana" -H "Authorization: Bearer $TOKEN"

# R06 - detalhar
curl -s http://localhost:3333/api/ocorrencias/<id-de-uma-ocorrencia> -H "Authorization: Bearer $TOKEN"
```

## O que observar

- `GET /ocorrencias` sem filtro nenhum só mostra `arquivada: false` (nada arquivado ainda nesta tarefa — isso é a 1.6).
- Um aluno autenticado recebe `403` em `GET /ocorrencias` (não pode listar), mas `200` em `GET /ocorrencias/:id` quando é o dele, e `403 ACESSO_NEGADO` ("Acesso restrito ao próprio histórico.") quando é de outro aluno.
- `turmaId` que não é UUID, ou `pageSize` > 50, voltam `400 VALIDACAO` com `detalhes`.

## Próximo passo

Confirmar os testes e marcar a Tarefa 1.5 como concluída em `specs/Task.md`; seguir para a Tarefa 1.6 — arquivar ocorrência e bloquear edição/exclusão (R07, R08).

## Confirmação dos testes (09/11/2026)

Testado manualmente no Postman: listagem padrão (só ativas, mais recente primeiro), busca por nome, detalhe de ocorrência própria (aluno titular) e de outro aluno (403). Os dois bugs descritos acima (Express 5 + `req.query`, e o fuso horário na data) foram corrigidos antes dessa rodada de testes. **Tarefa 1.5 concluída.** Próximo: Tarefa 1.6 (arquivar ocorrência e bloquear edição/exclusão).
