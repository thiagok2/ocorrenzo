# 2026-11-18 — Tarefa 2.3: `AuthContext`, `ProtectedRoute` e `LoginPage`

## O que foi feito

- `src/contexts/AuthContext.jsx`: contexto com `usuario`, `carregando`, `login(matricula, senha)` e `logout()`.
- `src/routes/ProtectedRoute.jsx`: igual à referência do Design §4.3, com um ajuste (ver abaixo).
- `src/pages/LoginPage.jsx` + `src/pages/login/LoginHero.jsx` + `src/pages/login/LoginForm.jsx`.
- `main.jsx` passou a envolver a aplicação em `<BrowserRouter><AuthProvider>...`.
- `App.jsx` deixou de ser a tela de teste da Tarefa 2.1 e passou a ser o mapa de rotas de verdade (ainda com páginas placeholder para o que falta construir).

## Arquitetura e escolhas

- **Estado inicial de `carregando`**: em vez de `useState(true)` e depois `setCarregando(false)` dentro do `useEffect` quando não há token, o estado parte de `useState(() => Boolean(localStorage.getItem('token')))`. Evita chamar `setState` de forma síncrona dentro do corpo do efeito (a regra `react-hooks/set-state-in-effect` do ESLint do projeto proíbe isso) e já nasce com o valor certo sem precisar de uma renderização extra.
- **`ProtectedRoute` aceita `perfis` opcional**: a referência do Design exige a lista de perfis sempre. Mudei para `if (perfis && !perfis.includes(usuario.perfil))`, porque a Tarefa 2.4 precisa de uma camada "só exige login, qualquer perfil" para envolver o layout autenticado (ver history da 2.4) — sem essa mudança, o `AppHeader` tentaria ler `usuario.perfil` antes de o perfil ser confirmado e quebraria.
- **Ícones do formulário**: usuário/cadeado/olho vêm do `components/ui/icons.jsx` criado na Tarefa 2.2.
- **Mostrar/ocultar senha**: campo de senha alterna `type="password"`/`type="text"` com um botão (`acaoDireita` do `TextField`), sem estado externo — fica só dentro do `LoginForm`.
- **Mensagens de erro**: `401` sempre mostra "Matrícula ou senha inválidos." (mesmo texto para matrícula inexistente ou senha errada, por segurança — já era assim no backend, Tarefa 1.3); qualquer outro erro mostra a mensagem que a API mandar, ou um texto genérico.
- **Textos da `LoginHero`**: o headline "Do registro à decisão." vem do Design (texto fixo). Os 3 benefícios **não têm cópia exata no Figma disponível** (Design §7 só manda troca um deles, "Relatórios por turma e por categoria" → "Consulte o histórico de cada aluno") — os outros dois ("Registre ocorrências em poucos cliques", "Arquive com motivo e autoria registrados") foram escritos para refletir exatamente o que o sistema faz, não um texto de marketing arbitrário. Vale revisar contra o Figma se/quando ele for consultado.
- **Redirecionamento pós-login**: `ROTA_INICIAL_POR_PERFIL` (coordenador/professor/apoio → `/ocorrencias`; aluno → `/meu-historico`) ficou em `utils/constantes.js` porque tanto o `LoginPage` (depois do login) quanto o `App.jsx` (rota `/`, para quem já está logado) precisam da mesma tabela.
- **Rotas placeholder**: `/ocorrencias`, `/alunos`, `/alunos/:id`, `/cadastros`, `/meu-historico` existem desde já (como a própria Tarefa 2.3 exige, para testar o redirecionamento pós-login e o bloqueio de acesso), mas renderizam `PlaceholderPage` até as Tarefas 2.5+ substituírem cada uma pela tela de verdade.

## O que observar

Depende de login real contra o backend — ainda não testado no navegador nesta sessão (ver pedido de verificação consolidado no fim da sessão de hoje). Ao testar: login com `2026000001`/`senha123` deve ir para `/ocorrencias`; um aluno (ex. matrícula `2024...`, senha = a própria matrícula) deve ir para `/meu-historico`; senha errada mostra "Matrícula ou senha inválidos."; recarregar a página (F5) deve manter a sessão (token salvo); digitar `/ocorrencias` na URL sem login deve redirecionar para `/login`.

## Próximo passo

Tarefa 2.4 — `AppHeader`, abas por perfil e layout.
