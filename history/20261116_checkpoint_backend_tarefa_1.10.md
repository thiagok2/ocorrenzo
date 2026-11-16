# Diário de desenvolvimento — 16/11/2026

# Tarefa 1.10 — Checkpoint do backend 🚦

## Objetivo

Esta tarefa não escreve código novo — é uma auditoria final que confirma que o núcleo do backend (R01 a R19) está pronto antes de liberar a Fase 2 (frontend). O checklist de aprovação está em `specs/Task.md`.

## O que foi conferido

| Item do checklist | Resultado |
| --- | --- |
| R01 a R19 no `api.http`, feliz + erros | Confirmado: as 19 rotas aparecem no arquivo, com múltiplos cenários cada (contagem: de 1 a 9 blocos `###` por rota). Todas já foram exercitadas via curl ao longo das Tarefas 1.3 a 1.9. |
| `npm test` verde | `Test Suites: 6 passed, 6 total` / `Tests: 17 passed, 17 total` (Tarefa 1.9). |
| Marco de Entrega (Requirements §11, itens 1-6) só pela API | Os 6 itens já foram demonstrados nas tarefas anteriores: login (1.3), registrar (1.4), listar/filtrar (1.5), arquivar com motivo e original preservado (1.6), histórico do aluno e "meu histórico" (1.7), professor sem vínculo → 403 e editar/excluir → 405 (1.6/1.8/1.9 P1-P2). |
| `.env.example` atualizado | Nenhuma variável nova foi introduzida desde a Tarefa 1.3 — já estava completo (`PORT`, `DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`). |
| README do backend | Criado `backend/README.md`: pré-requisitos, criar `.env`, criar os bancos (dev e teste), migrar e semear, subir a API, tabela de usuários de teste, como rodar `api.http` e `npm test`, mapa da estrutura de pastas. |
| Nenhuma rota/campo fora do Design | Auditado via `grep` nos arquivos de `src/routes/`: as rotas registradas são exatamente R01 a R19 (uma linha de rota por `router.get/post/patch/all`, cada uma comentada com o id da rota) — nada de R20/R21 (painel, Fase 3) implementado ainda, como esperado. |

## O que foi criado

- `backend/README.md` — único arquivo novo desta tarefa.

## Por que não havia README do backend até agora

As tarefas anteriores (1.1 a 1.9) foram documentadas didaticamente no `history/`, mas nenhum arquivo reunia, num só lugar, os passos operacionais pra alguém de fora (ou uma sessão nova) colocar o backend no ar do zero. É exatamente esse o papel do checkpoint: antes de abrir a porta pro frontend, garantir que a API se descreve e se sustenta por conta própria.

## Estado da Fase 1

**A Fase 1 (núcleo do backend) está encerrada.** Todas as tarefas 1.1 a 1.10 estão marcadas `[x]` em `specs/Task.md`. As únicas pendências formais que restam de tarefas específicas (não bloqueiam o checkpoint) são:

- Nada pendente de fato — as duas últimas pendências relacionadas a "professor sem vínculo" e "aluno transferido" (registradas nas Tarefas 1.4 a 1.7) foram resolvidas e confirmadas na Tarefa 1.8, assim que passou a existir uma segunda turma pra testar com ela.

## Próximo passo

Com o checkpoint aprovado, a **Fase 2 (Frontend)** pode começar — Tarefa 2.1 em diante (`specs/Task.md`): projeto React + Vite + Tailwind, autenticação, e as telas de cada perfil, seguindo a mesma ordem (núcleo antes de apoio, apoio antes de complementar).
