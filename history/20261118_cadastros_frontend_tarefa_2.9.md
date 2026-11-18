# 2026-11-18 — Tarefa 2.9: `CadastrosPage` — turmas, alunos, vínculos e transferência

## O que foi feito

- `src/hooks/useProfessores.js` (R17).
- `src/pages/cadastros/`: `CadastrosPage.jsx`, `TurmasTable.jsx`, `CadastroTurmaDialog.jsx`, `VinculosPanel.jsx`.
- `src/pages/alunos/CadastroAlunoDrawer.jsx` e `src/pages/alunos/TransferirAlunoDialog.jsx` — ficaram em `pages/alunos/`, não em `pages/cadastros/` (ver abaixo).
- `AlunosPage.jsx` ganhou o botão **Novo aluno** (só coordenador) e o cadastro de aluno; `AlunoRowActionsMenu.jsx` teve **Transferir de turma** ligado de verdade (estava desabilitado desde a Tarefa 2.8).
- Rota `/cadastros` deixou de ser placeholder.

## Arquitetura e escolhas

- **Aba "Alunos" do `CadastrosPage` reaproveita o `AlunosPage` inteiro**, exatamente como o Design pede ("Abas: Alunos (usa AlunosPage)"). Por isso o `CadastroAlunoDrawer` e o `TransferirAlunoDialog` — mesmo descritos no Design dentro da seção do `CadastrosPage` — foram colocados em `pages/alunos/` e ligados dentro do próprio `AlunosPage`: como esse componente aparece tanto em `/alunos` (Tarefa 2.8, acessível a professor e coordenador) quanto dentro da aba "Alunos" de `/cadastros` (só coordenador), ligar o cadastro/transferência ali faz as duas telas funcionarem com o mesmo código, sem duplicar nada. O botão "Novo aluno" e a opção "Transferir de turma" só aparecem para quem é coordenador (`usuario.perfil === 'coordenador'`), então em `/alunos` um professor não vê essas ações — só o coordenador, nas duas rotas.
- **Mensagens de erro 409 confirmadas direto no backend**, não inventadas a partir do Design: `backend/src/services/turma.service.js` → "Já existe uma turma com esse nome."; `aluno.service.js` → "Já existe um usuário com essa matrícula." e "O aluno já está nessa turma."; `professor.service.js` → "Professor já vinculado a essa turma.".
- **`VinculosPanel`**: ao trocar a turma selecionada, busca os professores vinculados (R18) direto com `api.get` (sem um hook `useX` dedicado, porque esse dado só é usado aqui e muda de fonte a cada seleção de turma — não é um recurso "global" como `useTurmas`/`useProfessores`). A lista de professores para vincular (R17, via `useProfessores`) já exclui quem já está vinculado àquela turma, pra não oferecer vincular duas vezes.
- **`TransferirAlunoDialog`**: a lista de turmas de destino exclui a turma atual do aluno (não faz sentido oferecer "transferir para a mesma turma", que o backend rejeitaria com `409` de qualquer forma — a UI já evita o erro óbvio antes de chamar a API).
- **`TurmasTable` ficou bem simples** (só a coluna "Turma"): o Design não lista nenhuma coluna ou ação além da própria lista + o diálogo de criação; adicionar colunas ou ações aqui seria inventar além do que foi pedido.

## O que observar

Depende do login como coordenador (professor e aluno não devem nem ver a aba "Cadastros" no cabeçalho — Tarefa 2.4). Roteiro sugerido: em "Cadastros", criar uma turma nova (e tentar criar outra com o mesmo nome — deve dar erro "Já existe uma turma com esse nome."); na aba "Alunos" (dentro de Cadastros, ou direto em `/alunos`), cadastrar um aluno novo com "Novo aluno" (e tentar matrícula repetida); transferir um aluno de turma pelo menu ⋮ (e confirmar que as ocorrências antigas dele continuam mostrando a turma original — já garantido pelo backend desde a Tarefa 1.8, só precisa confirmar que a UI não quebra isso); na aba "Vínculos", selecionar uma turma, vincular um professor e confirmar que ele passa a aparecer na lista de ocorrências dessa turma quando logado como esse professor.

## Próximo passo

Tarefa 2.10 — `MeuHistoricoPage` (perfil aluno).
