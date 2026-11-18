# Ocorrência+

Sistema web para registrar, consultar e arquivar ocorrências disciplinares e de destaque de alunos, substituindo os cadernos físicos da coordenação escolar.

Projeto da atividade de **3º bimestre** (3º ano do Ensino Médio), autores **Enzo e Lucas Rafael**.

> O Ocorrência+ existe para **REGISTRAR OCORRÊNCIAS**. Todo o escopo é medido contra essa frase — ver `specs/Requirements.md` §1.

---

## Como executar o projeto

### Pré-requisitos

- Node.js 22 LTS (ou compatível)
- PostgreSQL rodando localmente (ou acessível pela rede)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env     # edite DB_HOST/DB_PORT/DB_USER/DB_PASS/JWT_SECRET conforme seu PostgreSQL

createdb ocorrenzo        # banco de desenvolvimento (ajuste se DB_NAME for diferente no seu .env)

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm run dev                # API em http://localhost:3333/api
```

Detalhes completos (banco de teste, `api.http`, suíte automatizada, estrutura de pastas) estão em `backend/README.md`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL já aponta para http://localhost:3333/api por padrão

npm run dev                 # aplicação em http://localhost:5173
```

Confirme que o backend está no ar antes de abrir o frontend — a tela de login depende da API para autenticar.

### Usuários de teste

O seed de desenvolvimento (`backend/src/database/seeders/20261104090001-dev-turma-unica-e-pessoas.cjs`) cria 1 turma ("3º Ano") com todos os perfis já vinculados a ela. A senha de todo usuário **adulto** é `senha123`; a senha de cada **aluno** é a própria matrícula.

| Perfil | Nome | Matrícula | Senha |
| --- | --- | --- | --- |
| coordenador | Marcio Roberio | `2026000001` | `senha123` |
| professor | Thiago Oliveira | `2026000002` | `senha123` |
| professor | Osvaldo Pife | `2026000003` | `senha123` |
| professor | Marici Lopes | `2026000004` | `senha123` |
| apoio_pedagogico | Fabricia | `2026000005` | `senha123` |
| aluno (exemplo) | Alana Sofia Mendonça Ribeiro Trajano | `2024308532` | `2024308532` |

## Roteiro de demonstração (≈5 minutos)

Segue o Marco de Entrega do núcleo (`specs/Requirements.md` §11), já pela interface:

1. **Login como professor** (`2026000002` / `senha123`) → cai em "Ocorrências".
2. **Registrar uma ocorrência**: botão "Nova ocorrência" → escolher um aluno, tipo, gravidade e descrição → salvar. A ocorrência aparece no topo da lista.
3. **Listar e filtrar**: trocar a aba (Ativas/Arquivadas/Todas) e aplicar um filtro de tipo ou gravidade.
4. **Arquivar com motivo**: menu **⋮** da ocorrência recém-criada → Arquivar → informar o motivo. Abrir "Ver detalhes" e mostrar que a descrição original continua intacta junto do motivo e de quem arquivou.
5. **Histórico do aluno**: ir em "Alunos" → selecionar o mesmo aluno → "Ver ficha completa" → mostrar o histórico dele, com a ocorrência recém-arquivada.
6. **Sair e logar como aluno** (`2024308532` / `2024308532`) → "Meu histórico" mostra só as próprias ocorrências, sem nenhuma ação de registrar/arquivar.
7. **Acesso negado**: logado como aluno, digitar `/ocorrencias` na barra de endereço (redireciona para fora); e, se houver uma segunda turma sem vínculo, mostrar que um professor sem vínculo recebe "Acesso restrito às turmas em que você leciona." ao tentar registrar nela.

## Estrutura do repositório

```
docs/      → metodologia de especificação (SDD) e o prompt que orienta a LLM
specs/     → os artefatos da especificação deste projeto (briefing, requirements, design, tasks)
history/   → diário de desenvolvimento, uma entrada por sessão de trabalho
backend/   → API Node.js + Express (ESM), PostgreSQL + Sequelize (Design.md §3)
frontend/  → aplicação React + Vite + Tailwind (Design.md §4), consome a API do backend/
```

## Metodologia

Este projeto combina duas práticas que se complementam:

### 1. Spec-Driven Development (SDD)

Antes de escrever código, a ideia é transformada em três artefatos sequenciais e rastreáveis entre si:

**Requirements → Design → Tasks**

- `docs/metodologia-spec-driven-development.md` explica a metodologia (princípios, formato EARS, propriedades de corretude, grafo de dependências entre tasks).
- `docs/sdd-prompt-llm.md` é o conjunto de instruções usado para orientar uma LLM a produzir esses artefatos — com templates exatos e regras do tipo "nunca avance para o próximo artefato sem o anterior aprovado".
- `specs/Briefings.md`, `specs/Requirements.md`, `specs/Design.md` e `specs/Task.md` são os artefatos já produzidos para o Ocorrência+. `Task.md` é o plano de implementação em vigor: cada tarefa referencia os requisitos que implementa e está marcada como `[ ]` (pendente) ou `[x]` (concluída).

### 2. Execução passo a passo, com avaliação humana em cada etapa

A implementação **não** é feita de forma autônoma pela LLM. O fluxo adotado é:

1. A LLM propõe o próximo passo (um comando, um arquivo, uma decisão técnica) a partir da tarefa corrente em `specs/Task.md`.
2. **O estudante executa o passo no terminal** e avalia o resultado antes de seguir para o próximo.
3. Cada etapa relevante — e o raciocínio por trás dela — é registrada em `history/` como um diário de desenvolvimento, em um arquivo por sessão (`AAAAMMDD_resumo-curto.md`). Essas entradas explicam o "porquê" de cada comando e arquivo com mais detalhe do que o plano em `Task.md`, servindo também como material didático.

## Como continuar o desenvolvimento (para quem retomar o projeto, humano ou LLM)

1. Leia `specs/Requirements.md` → `specs/Design.md` → `specs/Task.md`, nessa ordem, para entender o que precisa ser feito e como.
2. Verifique em `specs/Task.md` quais tarefas já estão marcadas `[x]` e qual é a próxima tarefa pendente.
3. Leia a entrada mais recente em `history/` para saber exatamente onde a última sessão parou e quais decisões já foram tomadas.
4. **Regras de ordem não negociáveis** (detalhadas em `specs/Task.md` §1): backend antes de frontend; núcleo (Requisitos 1–4) antes de apoio (5–6), apoio antes de complementar (painel, Requisito 7). Nenhuma tela é iniciada antes do checkpoint de backend.
5. Ao implementar: siga uma subtarefa por vez, sem pular etapas nem adicionar algo que não esteja em `Requirements.md`. Após cada etapa relevante, registre em `history/` o que foi feito e por quê, e marque a subtarefa como concluída em `specs/Task.md`.
6. Se surgir uma ideia ou funcionalidade nova que não está nos specs atuais, ela não vira tarefa diretamente — primeiro passa pelo fluxo descrito em `docs/sdd-prompt-llm.md` (gera-se Requirements → Design → Tasks para a nova ideia, com validação humana entre cada artefato).

## Decisões técnicas já registradas

- Backend em Node.js com módulos ES (`import`/`export`), não CommonJS — ver `history/20261019_setup_projeto.md`.
- Stack: Express + PostgreSQL + Sequelize no backend; React + Vite + Tailwind (v4, via `@tailwindcss/vite`) no frontend (`specs/Design.md` §3–4).
- Nenhuma ocorrência é editável ou excluível após o registro — apenas arquivável com motivo (`specs/Requirements.md` RN1, RNF1).
- Alguns pontos do Design foram ajustados durante a implementação por limitação real do contrato das rotas (ex.: contagem das abas de situação só na aba selecionada; sem ordenação na lista de alunos) — ver `specs/Design.md` v3.3 no histórico de revisões e as entradas de `history/` de cada tarefa da Fase 2/3 para o porquê de cada ajuste.
