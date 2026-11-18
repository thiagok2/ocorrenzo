# 2026-11-18 — Tarefa 2.6: `RegistrarOcorrenciaDrawer`

## O que foi feito

- `src/pages/ocorrencias/AlunoCombobox.jsx`: busca assíncrona em `GET /alunos?q=` com debounce de 300 ms e mínimo de 2 caracteres.
- `src/pages/ocorrencias/RegistrarOcorrenciaDrawer.jsx`: os 5 campos do Design (Aluno, Tipo, Data, Gravidade, Descrição), validação no cliente, envio para `POST /ocorrencias`, confirmação de descarte.
- `src/components/ui/Textarea.jsx` e `src/components/ui/ConfirmDialog.jsx`: dois componentes novos de apoio (não estavam na lista fixa da Tarefa 2.2, mas são genéricos e vão ser reaproveitados na Tarefa 2.7 — `Textarea` pelo motivo do arquivamento, `ConfirmDialog` por qualquer outra confirmação futura).
- `OcorrenciasPage.jsx`: o botão **Nova ocorrência** deixou de estar desabilitado, ganhou um toast de sucesso e passou a reabrir a lista depois de registrar; a página também abre o drawer automaticamente quando a URL tem `?registrar=1`.

## Arquitetura e escolhas

- **Campos do corpo da requisição**: `alunoId`, `tipo`, `gravidade`, `descricao`, `data`, `referenciaId` — nomes conferidos direto em `backend/src/validators/ocorrencia.validator.js` (`esquemaRegistro`), não advinhados pelo Design (que só descreve os campos em português na tela).
- **Formato do erro 400**: o backend devolve `detalhes` como uma **lista** `[{ campo, mensagem }]` (`backend/src/middlewares/validar.js`), não um objeto `{ campo: mensagem }`. O drawer converte essa lista num objeto na hora de montar `erros`, para poder usar `erros.alunoId`, `erros.tipo` etc. direto nos componentes.
- **Reset do formulário a cada abertura**: em vez de um `useEffect` tentando sincronizar o estado interno do drawer com uma prop `aberto` que muda (o que cairia na mesma armadilha da Tarefa 2.2 com `ref`/`setState` durante o render), `OcorrenciasPage` mantém um contador `drawerChave` que incrementa a cada clique em "Nova ocorrência" (ou a cada `?registrar=1`) e passa isso como `key` do `RegistrarOcorrenciaDrawer`. Trocar a `key` força o React a desmontar e remontar o componente do zero — é o padrão oficial do React para "resetar o estado quando algo muda", e evita qualquer truque com `ref`.
- **Confirmação de descarte**: reaproveita o `Dialog` da Tarefa 2.2 através do novo `ConfirmDialog`. `temDados` é calculado a cada render (não guardado em estado) comparando os valores atuais dos campos com os valores "vazios" — é só uma expressão booleana, não precisa de efeito.
- **`?registrar=1`**: ao detectar o parâmetro, a página abre o drawer e imediatamente remove `registrar` da URL (via `setSearchParams(..., { replace: true })`), para a URL não ficar reabrindo o drawer sozinha se o usuário navegar de volta para a mesma página depois.
- **Toast sem contexto global**: o aviso "Ocorrência registrada com sucesso." é só um `useState` local em `OcorrenciasPage` com um `setTimeout` para desaparecer em 4 s — não criei um `ToastContext` global porque, por enquanto, só esta página precisa mostrar um toast. Se a Tarefa 2.7 (arquivar) ou outras páginas precisarem do mesmo aviso, promovo isso para um contexto compartilhado nessa hora.
- **Regra do ESLint `react-hooks/set-state-in-effect`**: apareceu de novo no `AlunoCombobox` (limpar as opções quando o texto fica curto) e no efeito do `?registrar=1` — mesma causa e mesma solução já registradas na Tarefa 2.1/2.5 (comentário `eslint-disable-next-line` explicando o motivo, já que é o padrão de data-fetching da própria documentação do React).

## O que observar

Depende de login (Tarefas 2.3/2.4) e da lista de ocorrências (Tarefa 2.5) funcionando. Roteiro sugerido, logado como professor ou coordenador: clicar em "Nova ocorrência"; digitar 2+ letras no campo Aluno e escolher um da lista; deixar Tipo/Data/Gravidade/Descrição sem preencher e clicar em "Salvar registro" — devem aparecer os 4 erros; preencher tudo e salvar — o drawer deve fechar, aparecer o toast verde e a ocorrência nova deve aparecer no topo da lista; abrir de novo, preencher algo e clicar em "Cancelar" ou `Esc` — deve aparecer "Descartar registro?"; confirmar e checar que o drawer fecha vazio. Testar também como professor tentando um aluno de turma não vinculada (combobox só deve trazer alunos das turmas dele, já que o escopo é resolvido no backend).

## Próximo passo

Tarefa 2.7 — Arquivar ocorrência e ver detalhes (liga **Ver detalhes**, **Arquivar** e **Registrar correção** no `RowActionsMenu`).
