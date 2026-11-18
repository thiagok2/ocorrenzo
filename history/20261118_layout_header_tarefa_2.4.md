# 2026-11-18 — Tarefa 2.4: Layout, abas por perfil e mapa de rotas

## O que foi feito

- `src/components/layout/AppHeader.jsx`: logo, abas de navegação por perfil, avatar + nome + perfil do usuário logado, botão **Sair**.
- `src/components/layout/PageHeader.jsx`: cabeçalho genérico de página (breadcrumb opcional, título, subtítulo, botão de ação) — reaproveitado pelas páginas a partir da Tarefa 2.5.
- `src/layouts/AppLayout.jsx`: envolve `AppHeader` + `<Outlet />`.
- `App.jsx` reestruturado para encaixar o layout entre o login e as páginas autenticadas.

## Arquitetura e escolhas

- **Abas por perfil** ficaram num mapa fixo em `AppHeader.jsx` (`ABAS_POR_PERFIL`): coordenador → Ocorrências + Cadastros; professor → Ocorrências + Alunos; apoio_pedagogico → Ocorrências; aluno → Meu histórico (Design §4.1 só define coordenador/professor/aluno explicitamente — apoio_pedagogico foi incluído com acesso só a Ocorrências, coerente com ele ter alcance de leitura igual ao coordenador, Design §1.3, mas sem abas de escrita).
- **Menu do usuário simplificado**: o Design descreve um "menu do usuário" (avatar, nome, perfil, sair). Em vez de um menu suspenso completo, o cabeçalho mostra avatar + nome + perfil sempre visíveis e um botão **Sair** direto ao lado — a única ação do menu é sair, então um dropdown completo (com a complexidade de fechar ao clicar fora, navegação por teclado etc.) seria complexidade sem benefício real para uma única ação.
- **Correção de ordem de proteção de rota** (o ponto mais importante desta tarefa): a primeira tentativa colocava o `AppLayout` (que já renderiza `AppHeader`, e `AppHeader` lê `usuario.perfil` direto) como elemento-pai das rotas protegidas por perfil. Isso quebrava: o React Router monta o `AppLayout` **antes** de o `ProtectedRoute` aninhado decidir se o usuário pode ver aquela rota — ou seja, `AppHeader` tentava ler `usuario.perfil` enquanto `usuario` ainda podia ser `null` (sessão carregando, ou acesso direto a uma URL protegida sem login), e quebrava com um erro de "não pode ler propriedade de null".
  **Correção:** acrescentei uma camada externa `<ProtectedRoute />` (sem `perfis` — por isso a Tarefa 2.3 ganhou esse parâmetro opcional) envolvendo o `AppLayout`. Essa camada já garante `usuario` não nulo antes de o `AppLayout`/`AppHeader` sequer montarem; os blocos `<ProtectedRoute perfis={[...]} />` de cada grupo de rotas continuam aninhados **dentro** do layout, cuidando só da restrição por perfil.
- **"Rolagem única" (Design §4.6)**: `AppHeader` usa `sticky top-0` dentro do fluxo normal do documento (não `fixed`), então a página inteira rola como uma unidade só e o cabeçalho acompanha fixo no topo — sem precisar de um container de conteúdo com `overflow` independente.
- **`RotaInicial`** (rota `/`): antes resolvia tudo com um `<Navigate to="/login" />` fixo; passou a checar `usuario`/`carregando` do `AuthContext` e mandar quem já está logado direto para a tela inicial do próprio perfil (`ROTA_INICIAL_POR_PERFIL`), em vez de jogar um usuário autenticado de volta para a tela de login.

## O que observar

Ainda depende de login real (mesma dependência da Tarefa 2.3). Ao testar: cada perfil deve ver só as abas listadas acima; entrar com a URL de uma rota de outro perfil (ex. aluno acessando `/cadastros` direto na barra de endereço) deve redirecionar; o cabeçalho deve continuar visível ao rolar a página para baixo; o botão **Sair** deve limpar a sessão e voltar para `/login`.

## Próximo passo

Tarefa 2.5 — `OcorrenciasPage`: lista, abas de situação, filtros e paginação.
