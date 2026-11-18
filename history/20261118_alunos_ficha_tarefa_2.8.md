# 2026-11-18 — Tarefa 2.8: `AlunosPage` (painel lateral) e `FichaAlunoPage`

## O que foi feito

- `src/hooks/useAluno.js` (R13) e `src/hooks/useHistoricoAluno.js` (R09), seguindo o mesmo formato `{ dados, carregando, erro, recarregar }` dos demais hooks.
- `src/pages/alunos/`: `AlunosPage.jsx`, `AlunosFilterBar.jsx`, `AlunosTable.jsx`, `AlunoRowActionsMenu.jsx`, `AlunoResumoPanel.jsx`, `HistoricoRecente.jsx`, `AlunoCabecalho.jsx`, `FichaAlunoPage.jsx`.
- `components/ui/StatTile.jsx` (novo, compartilhado entre `AlunoResumoPanel` e `AlunoCabecalho`).
- Rotas `/alunos` e `/alunos/:id` deixaram de ser placeholder.
- Refatoração de apoio: as listas de opções `OPCOES_TIPO`/`OPCOES_GRAVIDADE` (que já estavam repetidas em `FilterBar` e `RegistrarOcorrenciaDrawer`) foram movidas para `utils/constantes.js`; os campos de **Tipo · Gravidade · Período** (usados tanto na `OcorrenciasPage` quanto, agora, na `FichaAlunoPage`) saíram do `FilterBar` e foram para um componente novo, `FiltrosTipoGravidadePeriodo`, reaproveitado nas duas páginas.

## Arquitetura e escolhas

- **Confirmei os formatos de resposta no código do backend antes de montar as telas** (não advinhei pelo Design): `GET /alunos` (`backend/src/services/aluno.service.js`) devolve `turma` (não `turmaAtual`) em cada item; `GET /alunos/:id` devolve `resumo: { totalAtivas, graves, arquivadas, ultimaOcorrenciaEm }`; `GET /alunos/:id/ocorrencias` devolve `aluno: { ..., turmaAtual: {...} }` — **o mesmo endpoint usa nomes diferentes para "a turma de agora" dependendo de qual recurso é o aluno e qual é a ocorrência**. Isso importa na Tarefa 2.7/2.8: ao abrir "Registrar correção" a partir da ficha do aluno, o aluno vem de `historico.aluno.turmaAtual`, então o código remonta um objeto `{ id, nome, matricula, turma }` antes de passar para o `AlunoCombobox` (que espera `aluno.turma`), em vez de passar o objeto da API direto.
- **"Ordenar (Nome A-Z)" do Design não foi implementado**: o validador do backend para `GET /alunos` (`esquemaListagemAlunos`) só aceita `q`, `turmaId`, `page`, `pageSize` — não existe parâmetro de ordenação, e a consulta já ordena fixo por nome. Construir um controle de ordenação sem nenhum outro critério para oferecer (o Design só lista uma opção) não agregaria nada; fica registrado como desvio de escopo, igual ao das contagens das abas na Tarefa 2.5.
- **Painel lateral sem aluno selecionado**: `AlunoResumoPanel` só é montado (e só então faz as 2 chamadas de API que precisa — `useAluno` e `useHistoricoAluno`) quando existe um `selecionadoId`; antes disso, a página mostra um texto simples, sem gastar requisição nenhuma.
- **"Transferir de turma" inerte**: aparece no menu de ações só para coordenador, mas desabilitado — o diálogo de transferência (`TransferirAlunoDialog`) é explicitamente o trabalho da Tarefa 2.9 (`CadastrosPage`), mesmo padrão já usado nas Tarefas 2.5/2.6 para não antecipar código de outra tarefa.
- **`OcorrenciasTable` ganhou a prop `mostrarAluno`** (`true` por padrão): quando `false` (usado só pela `FichaAlunoPage`), a primeira coluna troca de "Aluno" (avatar + nome + turma) para só "Turma" — assim a mesma tabela/mesmo `RowActionsMenu` da Tarefa 2.5 é reaproveitada nas duas páginas, exatamente como o Design pede ("mesma tabela, sem a coluna ALUNO e com a turma registrada"), sem duplicar a tabela.
- **`AlunoCabecalho` faz o papel do `PageHeader`** na ficha do aluno (breadcrumb "← Alunos", nome, matrícula, turma atual e os 3 `StatTile`) — o Design não lista um `PageHeader` separado para essa página, só o `AlunoCabecalho`.

## O que observar

Depende das Tarefas 2.5–2.7. Roteiro sugerido, logado como professor ou coordenador: abrir "Alunos", buscar por nome/matrícula e filtrar por turma; clicar numa linha e ver o painel lateral preencher (3 números + até 3 ocorrências recentes); usar "Registrar ocorrência" tanto pelo menu ⋮ quanto pelo painel lateral e confirmar que o aluno já vem selecionado no drawer; clicar em "Ver ficha" (ou "Ver ficha completa") e confirmar que a ficha mostra o cabeçalho certo, os filtros de tipo/gravidade/período funcionam, a tabela não tem coluna "Aluno" mas mostra a turma de cada ocorrência, e arquivar/ver detalhes/registrar correção funcionam igual à `OcorrenciasPage`.

## Próximo passo

Tarefa 2.9 — `CadastrosPage`: turmas, alunos, vínculos e transferência.
