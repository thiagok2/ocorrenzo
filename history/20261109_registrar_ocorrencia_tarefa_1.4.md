# Diário de desenvolvimento — 09/11/2026

# Tarefa 1.4 — Registrar ocorrência (a rota mais importante)

## Objetivo

Até aqui, `POST /api/ocorrencias` (R04) sempre devolvia a mesma ocorrência de exemplo, só protegida por token (Tarefa 1.3). A Tarefa 1.4 troca isso pela implementação real: a ocorrência passa a ser gravada no banco, com duas regras de negócio centrais (RN3 e RN5):

1. **RN5 — a turma é capturada no momento do registro.** A ocorrência grava `turmaId` igual à turma **atual** do aluno, não uma referência "ao vivo" — se o aluno for transferido depois, a ocorrência antiga continua apontando pra turma de quando foi registrada.
2. **RN3 — escopo por vínculo.** Um professor só pode registrar ocorrência em alunos de turmas às quais está vinculado (tabela `professores_turmas`); o coordenador não tem essa restrição (`turmasPermitidas` retorna `null` para ele, que significa "todas").

## Peças criadas

| Arquivo | Papel |
| --- | --- |
| `src/services/escopo.service.js` | `turmasPermitidas(usuario)` (null = todas, `[]` = nenhuma, lista = vínculos do professor) e `podeAgirNaTurma(usuario, turmaId)` |
| `src/validators/ocorrencia.validator.js` | `esquemaRegistro` (Joi): `alunoId`/`referenciaId` UUID, `tipo` e `gravidade` como enum, `descricao` 1–500, `data` ISO não-futura |
| `src/services/ocorrencia.service.js` | `registrar(usuario, dados)`: busca o aluno, checa `podeAgirNaTurma`, valida `referenciaId` (se vier, precisa existir e ser do mesmo aluno), cria a ocorrência com `criadoPor` vindo do `usuario` do token (nunca do body) |
| `src/controllers/ocorrencia.controller.js` | `registrar` chama o service e formata a resposta no formato da R04 (`aluno`, `turma`, `criadoPor` como objetos) |
| `src/routes/ocorrencias.routes.js` | `POST /` trocado para `autorizarPerfil('professor', 'coordenador')` → `validar(esquemaRegistro)` → `ocorrenciaController.registrar`; R05–R08 continuam simuladas |
| `api.http` | `@alunoId` trocado para um UUID real do seed; novos casos: aluno tentando registrar (403), `alunoId` inexistente (404), descrição vazia (400), data futura (400), tipo inexistente (400), `criadoPor` do body ignorado |

Por que `autorizarPerfil` vem **antes** de `validar` na rota: se um aluno tentar registrar, a requisição é recusada com `403` sem nem olhar o corpo — não faz sentido gastar validação num pedido que já vai ser negado pelo perfil.

## Por que a resposta recarrega a ocorrência com `include`

`Ocorrencia.create(...)` devolve só os campos da tabela `ocorrencias` (ids, não os nomes). Como a resposta da R04 precisa de `aluno.nome`, `aluno.matricula`, `turma.nome` e `criadoPor.nome`, o service faz um `findByPk` depois do `create` com `include` nas quatro associações (`aluno`, `turma`, `autor`, `arquivador`) já definidas em `models/index.js` desde a Tarefa 1.2. O `arquivador` vem incluído pensando na reutilização do mesmo formatador nas Tarefas 1.5/1.6 (listar/arquivar), mesmo que numa ocorrência recém-criada ele sempre seja `null`.

## Como testar você mesmo

Com o servidor no ar (`npm run dev`), os casos abaixo foram adicionados ao `api.http` (REST Client) e também têm versão em `curl` — ambos usando o aluno real do seed `Alana Sofia Mendonça Ribeiro Trajano` (`matricula 2024308532`).

1. **Caminho feliz** (coordenador) → `201` com `aluno`, `turma` ("3º Ano") e `criadoPor` ("Marcio Roberio") preenchidos.
2. **Aluno tentando registrar** → `403 ACESSO_NEGADO` (rejeitado pelo `autorizarPerfil`, antes de qualquer consulta ao banco).
3. **`alunoId` inexistente** → `404 NAO_ENCONTRADO`.
4. **Descrição vazia** / **data futura** / **tipo inexistente** → `400 VALIDACAO` com `detalhes` por campo.
5. **`criadoPor` no body** → ignorado; a resposta sempre mostra o usuário do token como autor.

## O que observar

- A linha criada na tabela `ocorrencias` tem `turma_id` igual ao `turma_id` do aluno **no momento do registro** — útil de verificar depois da Tarefa 1.8 (transferência de aluno), quando esse valor vai parar de acompanhar a turma atual do aluno.
- `arquivada` sempre nasce `false` e `arquivamento` sempre `null` numa ocorrência nova.

## Pendência conhecida (limitação do seed de desenvolvimento)

O seed de desenvolvimento (Tarefa 1.2) só cria **uma turma** ("3º Ano"), com os 3 professores todos vinculados a ela. Isso significa que o cenário "professor sem vínculo → 403" (citado no `Pronto quando` da Tarefa 1.4, com os nomes de exemplo "8º A"/"7º C" do Design) **não é testável manualmente com os dados atuais** — não existe professor sem vínculo nem segunda turma no seed. Essa regra (`podeAgirNaTurma` recusando quando a turma não está na lista) continua implementada e correta; a cobertura desse caso específico fica para os testes automatizados da Tarefa 1.9 (Jest + Supertest), onde é mais simples montar um professor e uma turma fictícia sem vínculo.

## Próximo passo

Confirmar os testes acima, marcar a Tarefa 1.4 como concluída em `specs/Task.md` e seguir para a Tarefa 1.5 — listar e detalhar ocorrências com filtros e paginação (R05, R06).

## Confirmação dos testes (09/11/2026)

Sequência de login → token → registro testada via `curl`: caminho feliz (coordenador, aluno real do seed) devolveu `201` com `aluno`, `turma` e `criadoPor` corretos; `GET /ocorrencias/:id` confirmado como ainda simulado (R06 é da Tarefa 1.5). **Tarefa 1.4 concluída.** Próximo: Tarefa 1.5 (listar e detalhar de verdade).
