# 2026-11-18 — Tarefa 2.5: `OcorrenciasPage` — lista, abas de situação, filtros e paginação

## O que foi feito

- `src/hooks/useOcorrencias.js` e `src/hooks/useTurmas.js`: hooks de dados no formato `{ dados, carregando, erro, recarregar }` definido no Design §4.3.
- `src/pages/ocorrencias/`: `OcorrenciasPage.jsx`, `SituacaoTabs.jsx`, `FilterBar.jsx`, `OcorrenciasTable.jsx`, `RowActionsMenu.jsx`.
- Rota `/ocorrencias` passou a renderizar `OcorrenciasPage` em vez do placeholder.

## Arquitetura e escolhas

- **Filtros na URL**: `OcorrenciasPage` lê `situacao`, `q`, `turmaId`, `tipo`, `gravidade`, `dataInicio`, `dataFim` e `page` de `useSearchParams` (padrão `situacao=ativas`, `page=1`) e escreve de volta a cada mudança — exatamente o "filtros e paginação ficam na URL" do Design §4.3. Trocar qualquer filtro reinicia `page` para 1; trocar só a página (clique em Anterior/Próxima) não.
- **Chave de dependência dos hooks**: como `OcorrenciasPage` recalcula o objeto `filtros` do zero a cada renderização (lendo da URL), passar esse objeto direto para `useCallback`/`useEffect` faria o efeito disparar toda hora (identidade do objeto sempre nova). A solução foi serializar os filtros com `JSON.stringify` e usar essa string como a dependência real do `useCallback` que busca os dados — como filtros são só textos/números, a comparação por valor funciona e evita requisições repetidas.
- **Contagem nas abas (`SituacaoTabs`)**: o Design pede abas "Ativas · Arquivadas · Todas" **com contagem**. A rota `GET /api/ocorrencias` (R05, já fechada na Fase 1) devolve o `total` só da consulta atual — não dá, numa chamada só, o total das 3 situações ao mesmo tempo. Fazer 3 chamadas em paralelo só para preencher os números das abas inativas adicionaria complexidade e tráfego que não estão no contrato da R05. Decisão: a contagem aparece **só na aba selecionada no momento**, usando o `total` que já veio da busca atual; é uma redução consciente do "com contagem" do Design, registrada aqui para rediscutir se for considerada essencial.
- **Ações ainda inativas**: o botão **Nova ocorrência** (cabeçalho) e os itens do menu **⋮** de cada linha (**Ver detalhes**, **Arquivar**, **Registrar correção**) existem na tela mas não fazem nada ainda — exatamente como a própria Tarefa 2.5 pede ("RowActionsMenu (ações ainda inativas)"). Elas serão ligadas nas Tarefas 2.6 (drawer de registro) e 2.7 (arquivar/detalhes).
- **Coluna ALUNO mostra a turma registrada, não a atual**: `OcorrenciasTable` usa `ocorrencia.turma.nome` (a turma gravada na ocorrência no momento do registro) e não a turma atual do aluno — é a regra RN5/P3 (a turma de uma ocorrência nunca muda, mesmo que o aluno seja transferido depois), já implementada no backend desde a Tarefa 1.4; a tela só precisa exibir o campo certo.
- **`RowActionsMenu`**: implementado como um menu simples (`useState` + fechar ao clicar fora), sem reaproveitar o `Dialog`/`Drawer` da Tarefa 2.2 — é só uma lista de botões, não um modal.

## O que observar

Depende de login (Tarefas 2.3/2.4) e de dados reais no banco. Roteiro sugerido: logar como coordenador, abrir "Ocorrências", confirmar que a lista mostra as ocorrências ativas por padrão; trocar para a aba "Arquivadas"/"Todas" e ver a lista mudar; filtrar por turma/tipo/gravidade/período e por busca de aluno (nome ou matrícula) e confirmar que a URL reflete os filtros (dá pra copiar a URL, recarregar a página e manter o mesmo filtro); testar "Limpar filtros"; testar a paginação com mais de 10 ocorrências cadastradas. Logado como professor, confirmar que o filtro de turma só lista as turmas vinculadas a ele (vem de `GET /turmas`, que já aplica esse escopo no backend).

## Próximo passo

Tarefa 2.6 — `RegistrarOcorrenciaDrawer` (ligar o botão "Nova ocorrência").
