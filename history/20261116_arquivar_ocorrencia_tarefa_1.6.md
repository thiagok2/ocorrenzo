# Diário de desenvolvimento — 16/11/2026

# Tarefa 1.6 — Arquivar ocorrência e bloquear edição/exclusão

## Objetivo

Até aqui, uma ocorrência registrada (Tarefa 1.4) não tinha como ser corrigida de forma auditável, e nada no código impedia alguém de editar ou apagar o histórico direto no banco via API. A Tarefa 1.6 implementa a única correção permitida (RN1): **arquivar**, nunca editar ou excluir. Arquivar não apaga nada — só marca a ocorrência como inativa, com motivo, autor e data/hora, preservando o conteúdo original.

## O que foi criado/alterado

| Arquivo | O que mudou |
| --- | --- |
| `src/validators/ocorrencia.validator.js` | novo `esquemaArquivamento`: `motivo` (string, 1–500, obrigatório) |
| `src/services/ocorrencia.service.js` | `arquivar(usuario, id, motivo)`: busca a ocorrência (`404` se não existir), checa `podeAgirNaTurma` pela **turma registrada na ocorrência** (não a turma atual do aluno — RN5 já capturou isso no registro), `409 CONFLITO` se já estiver arquivada, senão seta os 4 campos de arquivamento e chama `ocorrencia.save()` |
| `src/controllers/ocorrencia.controller.js` | `arquivar` chama o service e devolve a ocorrência serializada (mesmo formato de sempre, agora com `arquivada: true` e `arquivamento` preenchido) |
| `src/routes/ocorrencias.routes.js` | `POST /:id/arquivamento` trocado pela rota real (`autorizarPerfil('professor','coordenador')` → `validar(esquemaArquivamento)` → `ocorrenciaController.arquivar`); removido o `ocorrenciaExemplo` fixo, que não é mais usado por nenhuma rota |
| `api.http` | cenários reais de R07: sem motivo (400), caminho feliz (200), arquivar duas vezes (409), aluno tentando arquivar (403), id inexistente (404); e confirmação de que R08 continua recusando `PATCH`/`DELETE` numa ocorrência já arquivada |

## Por que a imutabilidade não precisa de lógica nova aqui

O `ocorrencia.save()` já é suficiente pra travar a edição — os hooks `beforeUpdate`/`beforeDestroy` do modelo `Ocorrencia` (criados na Tarefa 1.2) são quem garante a RN1:

- `beforeUpdate` deixa passar **só** se os campos alterados estiverem entre os 4 de arquivamento (`arquivada`, `motivoArquivamento`, `arquivadoPor`, `arquivadoEm`); qualquer outro campo alterado por `save()` lança `Error('OCORRENCIA_IMUTAVEL')`.
- `beforeDestroy` sempre lança `Error('OCORRENCIA_NAO_PODE_SER_EXCLUIDA')`.

Isso significa que `services/ocorrencia.service.js` nunca precisou (e nunca vai precisar) de uma função `editar`/`excluir` — a única forma de "mudar" uma ocorrência depois de criada é por este único caminho (`arquivar`), e o `router.all('/:id')` (R08, já existente desde a Tarefa 1.1) devolve `405` pra qualquer tentativa de `PUT`/`PATCH`/`DELETE` antes mesmo de chegar no banco.

## Como testar você mesmo

Com o servidor no ar, os cenários abaixo estão no `api.http` atualizado (usa `{{ocorrenciaIdReal}}`, capturado automaticamente do registro feito mais acima no mesmo arquivo):

1. Arquivar sem `motivo` → `400 VALIDACAO`.
2. Arquivar com motivo → `200`, com `arquivada: true` e `arquivamento: { motivo, por: { id, nome }, em }`.
3. Arquivar a mesma ocorrência de novo → `409 CONFLITO` ("Esta ocorrência já está arquivada.").
4. Aluno tentando arquivar → `403` (recusado pelo `autorizarPerfil`, nem chega no service).
5. Id inexistente → `404 NAO_ENCONTRADO`.
6. `GET` na ocorrência depois do passo 2 → `tipo`, `gravidade`, `descricao` e `data` **idênticos** ao que foi registrado na Tarefa 1.4.
7. `PATCH`/`DELETE` na mesma ocorrência (já arquivada) → `405 METODO_NAO_PERMITIDO`.

## O que observar

- A turma usada pra decidir o `403` em `arquivar` é `ocorrencia.turmaId` (a turma **registrada** na ocorrência), não a turma atual do aluno — mesma regra do Design (RN5): um professor só arquiva o que ele mesmo poderia ter registrado, mesmo que o aluno já tenha sido transferido depois.
- A mesma limitação de seed já registrada nas Tarefas 1.4/1.5 (só uma turma, todos os professores vinculados a ela) continua valendo aqui: o `403` de "professor sem vínculo" pro `arquivar` tem a mesma lógica que o `registrar`/`listar`/`detalhar`, mas não é testável manualmente com os dados atuais — cobertura fica pra Tarefa 1.9.

## Próximo passo

Confirmar os testes acima e marcar a Tarefa 1.6 como concluída em `specs/Task.md`; seguir para a Tarefa 1.7 — histórico do aluno, visão do aluno e leituras de apoio (R09 a R13).

## Confirmação dos testes (16/11/2026)

Os 8 cenários do roteiro acima foram confirmados via `curl` com o servidor no ar: sem motivo (400), caminho feliz (200, com `arquivamento` preenchido e os demais campos idênticos ao registro original), arquivar duas vezes (409), aluno tentando arquivar (403), id inexistente (404), e `PATCH`/`DELETE` numa ocorrência já arquivada (405, nos dois casos). **Tarefa 1.6 concluída.** Próximo: Tarefa 1.7 (histórico do aluno, visão do aluno e leituras de apoio).
