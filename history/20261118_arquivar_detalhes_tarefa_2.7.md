# 2026-11-18 — Tarefa 2.7: Arquivar ocorrência e ver detalhes

## O que foi feito

- `src/pages/ocorrencias/OcorrenciaDetalheDialog.jsx`: mostra todos os dados da ocorrência e, se arquivada, o motivo + autor + data/hora do arquivamento.
- `src/pages/ocorrencias/ArquivarOcorrenciaDialog.jsx`: motivo obrigatório (usa o `Textarea` da Tarefa 2.6, com contador 0/500), chama `POST /ocorrencias/:id/arquivamento`.
- `RowActionsMenu.jsx`: as 3 ações (**Ver detalhes**, **Arquivar**, **Registrar correção**) deixaram de ser botões desabilitados e passaram a chamar os callbacks recebidos de `OcorrenciasPage`; "Arquivar" continua oculto quando a ocorrência já está arquivada (regra que já existia desde a 2.5, só estava sem uso).
- `OcorrenciasTable.jsx` e `OcorrenciasPage.jsx` atualizados para passar os callbacks e guardar qual ocorrência está em cada diálogo.

## Arquitetura e escolhas

- **Sem nova chamada para "Ver detalhes"**: `serializarOcorrencia` no backend (`backend/src/controllers/ocorrencia.controller.js`) já devolve **todos** os campos (aluno, turma, tipo, gravidade, descrição, data, situação, arquivamento, autor) em cada item da listagem (R05) — exatamente o mesmo formato que `GET /ocorrencias/:id` (R06) devolveria. Por isso `OcorrenciaDetalheDialog` só recebe o item que já está em memória (`dados.itens`), sem buscar de novo na API. Um diálogo de detalhe baseado em `GET /ocorrencias/:id` só faria sentido se a tela chegasse a esse dado por um link direto (ex. e-mail, favorito) sem ter passado pela lista — não é o caso aqui.
- **Estado de "qual ocorrência está aberta em qual diálogo"**: em vez de um booleano `detalheAberto`/`arquivarAberto` + uma variável separada "qual ocorrência", cada diálogo guarda a própria ocorrência (ou `null`) — `detalheAberto` é a ocorrência (ou `null`), não um booleano. Isso elimina a necessidade de dois `useState` por diálogo e garante que o diálogo sempre mostra a ocorrência certa.
- **"Registrar correção"**: reaproveita o `RegistrarOcorrenciaDrawer` da Tarefa 2.6, mas agora o "contexto" do drawer (`alunoInicial`, `referenciaId`) é escolhido na hora de abrir — um objeto `drawerContexto` guardado em estado, zerado por padrão (`CONTEXTO_DRAWER_VAZIO`) e preenchido só quando a abertura vem do menu de ações. Continua usando o truque da `key` (Tarefa 2.6) para o formulário nascer limpo a cada abertura, agora já com o aluno pré-selecionado e a `referenciaId` prontos.
- **Erros do arquivamento**: `409` (já arquivada) e `403` (sem vínculo com a turma) mostram a mensagem certa dentro do próprio diálogo; qualquer outro erro cai num texto genérico. Motivo vazio é bloqueado no cliente antes mesmo de chamar a API (o backend também bloqueia com `400`, mas o cliente intercepta primeiro).

## O que observar

Depende da lista (2.5) e do registro (2.6) já funcionando. Roteiro sugerido: abrir "Ver detalhes" de uma ocorrência ativa e confirmar que todos os campos aparecem; "Arquivar" uma ocorrência sem motivo (deve bloquear), depois com motivo (deve fechar, mostrar toast "Ocorrência arquivada com sucesso.", e ela deve sair da aba "Ativas" e aparecer em "Arquivadas"/"Todas" com a descrição original intacta); abrir "Ver detalhes" da mesma ocorrência arquivada e confirmar que aparece o motivo + quem arquivou + quando; tentar arquivar a mesma ocorrência de novo (deve dar "Esta ocorrência já está arquivada."); usar "Registrar correção" numa ocorrência e confirmar que o drawer abre com o aluno já selecionado.

## Próximo passo

Tarefa 2.8 — `AlunosPage` (painel lateral) e `FichaAlunoPage`.
