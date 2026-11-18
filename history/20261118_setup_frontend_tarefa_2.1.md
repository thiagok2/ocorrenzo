# 2026-11-18 — Tarefa 2.1: Projeto React + Vite + Tailwind + Router + cliente HTTP

## Contexto

Com o checkpoint da Tarefa 1.10 confirmado (backend completo: 19 rotas, 17 testes verdes), a Fase 2 foi liberada. Esta é a primeira tarefa do frontend: criar a base do projeto React que vai consumir a API — sem telas de verdade ainda, só a fundação (bundler, roteador, cliente HTTP, identidade visual).

## O que foi feito

1. **Scaffold do projeto** — `npm create vite@latest frontend -- --template react` dentro de `ocorrenzo/`, executado pelo usuário no terminal (React 19 + Vite 8, conforme o template atual). Instalado também pelo usuário: `react-router-dom`, `axios`, `tailwindcss` + `@tailwindcss/vite`, e as devDependencies de teste (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) — a instalação das últimas é preparação para a Tarefa 2.11, não usada ainda.

2. **Tailwind v4** — escolhido o plugin oficial `@tailwindcss/vite` (em vez do caminho via PostCSS), que é o padrão recomendado pela documentação do Tailwind v4 para projetos Vite: menos configuração, sem `tailwind.config.js` nem `postcss.config.js`. Plugin registrado em `vite.config.js` junto do plugin do React.

3. **Tokens visuais (Design §4.2)** — mapeados em `src/index.css` com a sintaxe `@theme` do Tailwind v4 (`--color-*`, `--radius-*`, `--font-sans`), que gera automaticamente as classes utilitárias (`bg-primaria`, `text-texto-secundario`, `rounded-card`, etc.) sem precisar de `tailwind.config.js`. Cores de gravidade e situação foram desdobradas em pares `-texto`/`-fundo` (ex.: `gravidade-leve-texto`, `gravidade-leve-fundo`) porque cada badge do Design usa duas cores (texto sobre fundo), e o Tailwind não tem um conceito nativo de "par de cores" num único token.

4. **Cliente HTTP** — `src/services/api.js` criado exatamente como a referência do Design §4.3: instância do Axios com `baseURL` vinda de `VITE_API_URL`, interceptor de request que injeta o `Bearer <token>` do `localStorage`, e interceptor de response que desloga e redireciona para `/login` em qualquer `401` que não seja da própria rota de login (evita loop de redirecionamento no login inválido).

5. **Utilitários** — `src/utils/constantes.js` (nomes legíveis para os 5 `tipo` e 3 `gravidade` do banco, mais os 4 `perfil`) e `src/utils/formatadores.js` (`formatarData` no padrão `dd mmm aaaa` pedido pelo Design, e `formatarDataHora` reaproveitando a mesma função para o formato usado no arquivamento). Implementado sem biblioteca de datas (ex.: `date-fns`) porque o projeto só precisa desse um formato fixo em português — não há necessidade de fuso horário, parsing complexo ou i18n.

6. **`.env` / `.env.example`** — `VITE_API_URL=http://localhost:3333/api`, já cobertos pelo `.gitignore` existente na raiz (`.env*` exceto `.env.example`).

7. **Boilerplate do Vite removido** — `App.jsx` e `App.css` do template padrão (contador, links de documentação, logos) foram substituídos por uma tela mínima que chama `GET /api/health` pelo `api.js` e mostra o resultado na tela. Essa tela existe só para provar que a Tarefa 2.1 está pronta (Tailwind renderizando, Axios se comunicando com o backend, CORS ok); será substituída pelo roteador de verdade na Tarefa 2.3/2.4. A imagem `src/assets/hero.png` foi mantida (vai ser usada na `LoginHero` da Tarefa 2.3).

## O que observar (teste manual)

Com o backend no ar (`cd backend && npm run dev`, porta 3333) e o frontend também (`cd frontend && npm run dev`, porta 5173 por padrão):

- Abrir `http://localhost:5173` deve mostrar um card centralizado "Ocorrência+" com o texto `{"status":"ok", ...}` (ou o que a R01 devolver) — confirma que o Axios conseguiu falar com a API sem erro de CORS.
- Se o backend estiver fora do ar, o card deve mostrar `erro: Network Error` (ou similar) em vez de travar a tela — confirma que o `catch` do `useEffect` está funcionando.
- Visualmente, o fundo deve estar no cinza-claro (`#F8FAFB`) e o texto de status em verde (`#2A622D`) — confirma que os tokens do `@theme` estão gerando as classes Tailwind corretamente.
- `npm run build` dentro de `frontend/` deve terminar sem erros (já verificado nesta sessão).

## Próximo passo

Tarefa 2.2 — componentes base (`components/ui`): `Button`, `TextField`, `SelectFilter`, `SearchInput`, `GravidadeBadge`, `SituacaoBadge`, `TipoLabel`, `Avatar`, `Pagination`, `Drawer`, `Dialog`, `SegmentedControl`, `Toast`, `EmptyState`, `ErrorState`, `Skeleton`.
