# 2026-11-18 — Tarefa 4.1: README, roteiro de demonstração e revisão final

## Contexto

Última tarefa do plano (`specs/Task.md`). Com a Fase 3 (painel) concluída, faltava só fechar a documentação: deixar o README da raiz autossuficiente para quem nunca rodou o projeto, escrever o roteiro de demonstração e revisar os 3 arquivos de spec contra o que foi de fato construído.

## O que foi feito

1. **README da raiz reescrito.** Antes só falava de metodologia (SDD, fluxo passo a passo) e dizia "frontend ainda não iniciado" — desatualizado desde a Tarefa 2.1. Agora tem, logo no topo: pré-requisitos, passo a passo do backend (instalar, `.env`, criar banco, migrar, semear, subir), passo a passo do frontend (instalar, `.env`, subir) e a tabela de usuários de teste (perfil, nome, matrícula, senha — já existia só dentro de `backend/README.md`, trazida pra raiz porque o critério de pronto é "outra pessoa consegue rodar o projeto **só com o README**" da raiz, sem precisar entrar em `backend/README.md` primeiro).
2. **Roteiro de demonstração (~5 minutos)** adicionado ao README da raiz, seguindo o Marco de Entrega (`specs/Requirements.md` §11): login professor → registrar → listar/filtrar → arquivar com motivo (mostrando o original preservado) → ficha do aluno → login aluno → "Meu histórico" → tentativa de acesso negado.
3. **Revisão dos 3 arquivos de spec**: comparando `Design.md` com o que foi efetivamente implementado nas Tarefas 2.5–3.2, encontrei 2 pontos onde a implementação ficou **mais restrita** do que o Design original, por limite real do contrato das rotas do backend (que já estava fechado desde a Tarefa 1.10 — mudar a rota agora seria reabrir o núcleo, fora do que esta tarefa pede). Documentei os dois como uma revisão formal `v3.3` do `Design.md` (seguindo a mesma tabela de histórico de revisões que o documento já usava desde a v1.0):
   - `SituacaoTabs` mostra a contagem só na aba selecionada, não nas 3 ao mesmo tempo — `GET /ocorrencias` (R05) devolve o `total` só da consulta atual.
   - O `FilterBar` de `AlunosPage` perdeu o controle de "Ordenar (Nome A-Z)" do Design — `GET /alunos` (R12) não tem parâmetro de ordenação; a lista já vem fixa por nome.
   
   Esses dois ajustes já estavam documentados nas entradas de `history/` das Tarefas 2.5 e 2.8 (e marcados como nota no `Task.md`) — essa revisão do `Design.md` só torna isso visível em quem lê **só** o Design, sem precisar ir até `history/`.
4. `specs/Requirements.md` revisado e **sem alterações**: nenhum requisito de negócio mudou, só detalhes de interface — não havia nada para corrigir nesse arquivo.
5. `backend/README.md`: corrigida uma referência desatualizada ("5 propriedades" → "6 propriedades", incluindo P6 do painel, criada na Tarefa 3.1).

## O que observar

Leia o novo README da raiz do começo (sem ter visto o projeto antes) e tente segui-lo ao pé da letra, num terminal limpo, para confirmar que ele sozinho é suficiente para rodar o backend e o frontend e chegar até a tela de login. Esse é o único item do "Pronto quando" desta tarefa que ainda depende de verificação externa — tudo o resto (o próprio README, o roteiro, a revisão dos 3 arquivos) já está feito.

## Status do projeto

Com esta tarefa, as 4 fases do `specs/Task.md` estão implementadas: núcleo (backend + frontend, Fase 1 e 2), painel complementar (Fase 3) e fechamento (Fase 4). O que ainda depende de verificação humana num navegador real — o roteiro completo do Marco de Entrega nos 3 perfis e a comparação visual com o Figma (Tarefa 2.11, passos 2 e 3) — continua em aberto, por decisão explícita do usuário de testar tudo de uma vez ao final, em vez de a cada tarefa.
