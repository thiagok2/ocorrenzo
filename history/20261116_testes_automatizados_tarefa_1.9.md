# Diário de desenvolvimento — 16/11/2026

# Tarefa 1.9 — Testes automatizados do backend

## Objetivo

Transformar as 5 propriedades de corretude do Design (P1 a P5) em testes que rodam sempre com `npm test`, em vez de depender só de testes manuais via `api.http`/Postman — que foi como todo o núcleo (Tarefas 1.3 a 1.8) foi validado até aqui.

## O que foi criado

| Arquivo | Papel |
| --- | --- |
| `jest.config.cjs` | config do Jest em CommonJS (independente do `"type": "module"` do projeto), com `transform: {}` pra deixar o Node tratar os módulos ES nativamente |
| `package.json` (`scripts.test`) | `NODE_ENV=test NODE_OPTIONS=--experimental-vm-modules jest --runInBand --forceExit` |
| `tests/helpers.js` | funções reaproveitadas por todos os testes: `login`, `registrarOcorrencia`, `criarTurma`, `criarAluno`, `buscarAlunoPorMatricula`, `sufixoUnico` (pra nomes/matrículas únicos), e as matrículas fixas do seed (coordenador, um professor, dois alunos) |
| `tests/p1-imutabilidade.test.js` | P1 — `PATCH`/`DELETE` → `405`; `instancia.update()`/`destroy()` fora da API → lança `OCORRENCIA_IMUTAVEL`/`OCORRENCIA_NAO_PODE_SER_EXCLUIDA` |
| `tests/p2-escopo.test.js` | P2 — professor sem vínculo: registrar, listar por `turmaId`, detalhar e arquivar → `403` |
| `tests/p3-transferencia.test.js` | P3 — registra → transfere o aluno → a ocorrência antiga mantém a turma original (RN5) |
| `tests/p4-arquivamento.test.js` | P4 — arquivar sem motivo → `400`; arquivar duas vezes → `409`; depois de arquivar, os dados originais continuam intactos |
| `tests/p5-visao-aluno.test.js` | P5 — aluno não acessa `/alunos/{outro}/ocorrencias` (`403`); `/me/ocorrencias` só traz as próprias |
| `tests/geral.test.js` | login inválido (`401`), token ausente (`401`), descrição de 501 caracteres (`400`), data futura (`400`) |

Cada teste de P2/P3 cria sua própria turma/aluno novos (via `criarTurma`/`criarAluno`, que chamam a API de verdade — R14/R15) em vez de reaproveitar os dados fixos do seed. Isso é o que torna possível o teste de P2 (professor sem vínculo) de forma 100% automática e independente — sem precisar, como aconteceu manualmente nas Tarefas 1.4 a 1.7, esperar a Tarefa 1.8 existir pra ter uma segunda turma à mão.

## Duas decisões de configuração que valem registrar

### 1. Jest + ESM

O projeto inteiro usa `import`/`export` (`"type": "module"` no `package.json`), e o Jest, por padrão, espera CommonJS. A combinação que funciona hoje (Jest 29+, Node 24) é: `jest.config.cjs` (arquivo `.cjs` — sempre CommonJS, **mesmo** com `"type": "module"` no projeto) com `transform: {}` (desliga a transformação padrão via Babel) + rodar com a flag `NODE_OPTIONS=--experimental-vm-modules`, que deixa o próprio Node interpretar os módulos ES dos arquivos de teste e do código-fonte sem nenhuma conversão.

### 2. Rate limit do login precisou ser relaxado em teste

A suíte faz muitos logins (cada teste de escopo loga como coordenador e/ou professor e/ou aluno). Isso bateria direto no limite de 10 tentativas/15min do `express-rate-limit` (o mesmo limite que já tinha interrompido os testes manuais via curl/Postman várias vezes nesta sessão) — só que agora de forma sistemática, já que `npm test` faz dezenas de logins em segundos. Corrigido em `routes/auth.routes.js`: `max: process.env.NODE_ENV === 'test' ? 10000 : 10` — o limite real de produção (10) continua intacto; só o ambiente de teste ganha uma margem alta, porque não é isso que o teste automatizado está validando (não há nenhum teste de P1-P5 ou "Geral" cobrindo o `429`).

## Um bug encontrado nos próprios testes (não no código da API)

A primeira rodada da suíte deu `17 - 1 = 16` testes passando; o teste de P3 falhava com `400` onde esperava `201`. Causa: o nome de turma que o teste gerava (`"Turma P3 Destino " + sufixo`) passava dos 30 caracteres permitidos por `esquemaCriarTurma` — a criação da turma falhava silenciosamente (400 lá, não aqui), e o teste só notou o erro bem mais adiante, na criação da ocorrência (que recebia um `turmaId: undefined` e devolvia `400` por outro motivo). Corrigido encurtando o sufixo único (`Date.now().toString(36)`, base 36 em vez de decimal) e os nomes de turma de teste (`P3-A-${sufixo}` em vez de `"Turma P3 Destino " + sufixo`).

**Lição prática:** ao gerar nomes únicos pra fixtures de teste, sempre conferir o limite de tamanho do campo real — um nome "único" que estoura a validação falha de um jeito que pode aparecer em outro lugar bem mais confuso de rastrear.

## Como rodar você mesmo

```bash
cd backend
npm test
```

Resultado esperado: `Test Suites: 6 passed, 6 total` / `Tests: 17 passed, 17 total`. A suíte pode ser rodada várias vezes sem resetar o banco de teste — cada execução cria suas próprias turmas/alunos com nomes/matrículas únicos (não reaproveita nem conflita com a execução anterior).

## Próximo passo

Marcar a Tarefa 1.9 como concluída em `specs/Task.md` e seguir para a Tarefa 1.10 — o checkpoint final do backend (R01-R19 confirmadas no `api.http`, `npm test` verde, `.env.example` atualizado, README do backend) que libera a Fase 2 (frontend).
