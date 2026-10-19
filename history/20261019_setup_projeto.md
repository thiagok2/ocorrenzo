# Diário de desenvolvimento — 19/10/2026

## Objetivo

Construir o Ocorrência+ passo a passo, começando pelo backend. Este diário explica as ações e os arquivos criados com mais detalhe que o plano geral de `specs/Task.md`.

A organização planejada é um monorepo: backend e frontend ficam em pastas próprias na raiz. O desenvolvimento começa pela API; a aplicação frontend será iniciada mais adiante, conforme a ordem das tarefas.

## Etapa 1 — Criar as pastas principais

Na raiz do projeto, foram criadas:

- `backend/`: projeto da API Node.js.
- `frontend/`: futura aplicação React.
- `history/`: diário didático das etapas.

As pastas `docs/` e `specs/` já existiam e permanecem na raiz.

## Etapa 2 — Inicializar o projeto Node.js

Dentro de `backend/`, foi executado:

```bash
npm init -y
```

Esse comando inicializa um pacote Node.js e cria `backend/package.json`. A opção `-y` aceita as configurações padrão sem abrir uma sequência de perguntas.

O `package.json` é o manifesto do projeto: guarda informações como nome, scripts e dependências. O `npm init -y` criou inicialmente `"type": "commonjs"`, mas decidimos trocar o projeto para módulos ECMAScript (ESM), usando `import` e `export`.

## Etapa 3 — Criar as pastas de trabalho do backend

Dentro de `backend/`, foi executado:

```bash
mkdir -p src/config src/database/migrations src/database/seeders src/models src/routes src/controllers src/services src/middlewares src/validators src/utils tests
```

O comando cria as pastas iniciais:

- `src/config/`: configuração da aplicação, incluindo a conexão com o banco mais adiante.
- `src/database/migrations/`: histórico versionado de alterações no banco.
- `src/database/seeders/`: dados de desenvolvimento ou demonstração para popular o banco.
- `src/models/`: modelos Sequelize que representam as tabelas e relações.
- `src/routes/`: caminhos HTTP disponibilizados pela API.
- `src/controllers/`: recebem requisições e organizam as respostas HTTP.
- `src/services/`: regras e operações de negócio.
- `src/middlewares/`: funções executadas durante o processamento das requisições, como autenticação e tratamento de erros.
- `src/validators/`: validação dos dados enviados para a API.
- `src/utils/`: utilitários compartilhados.
- `tests/`: testes automatizados do backend.

A opção `-p` cria as pastas intermediárias necessárias, como `src/` e `src/database/`.

## Etapa 4 — Instalar dependências da API inicial

No terminal, dentro de `backend/`, foram executados:

```bash
npm install express cors dotenv joi express-rate-limit
npm install --save-dev nodemon
```

O primeiro comando instalou dependências necessárias pela aplicação:

- `express`: cria o servidor HTTP e organiza as rotas da API.
- `cors`: configura quais origens podem acessar a API pelo navegador.
- `dotenv`: lê configurações locais de um arquivo `.env`.
- `joi`: valida os dados recebidos nas requisições.
- `express-rate-limit`: limita a frequência de requisições, útil para proteger endpoints como login.

O segundo comando instalou `nodemon` como dependência de desenvolvimento. Ele reinicia o servidor automaticamente quando os arquivos mudam. A opção `--save-dev` registra ferramentas de desenvolvimento em `devDependencies`, separadas das dependências de execução.

O npm registrou as dependências em `backend/package.json` e criou/atualizou `backend/package-lock.json`, que fixa as versões resolvidas para instalações reproduzíveis.

No momento desta etapa, `package.json` lista `cors`, `dotenv`, `express`, `express-rate-limit` e `joi` em `dependencies`, e `nodemon` em `devDependencies`. As versões declaradas observadas foram `^2.8.6`, `^18.0.8`, `^5.3.0`, `^8.7.1`, `^18.3.0` e `^3.1.14`, respectivamente.

Adiaremos `sequelize`, `pg` e `pg-hstore` para a etapa de integração com PostgreSQL, e `jsonwebtoken` e `bcryptjs` para a implementação da autenticação real. Dessa forma, cada conjunto de dependências entra quando for explicado e usado.

## Etapa 5 — Configurar comandos do pacote

No `backend/package.json`, o campo `main` foi alterado para `src/server.js`, e os scripts foram configurados assim:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

- `npm start` executará o servidor com Node.js.
- `npm run dev` executará o servidor com Nodemon, que reinicia o processo após mudanças nos arquivos.
- O script `test` continua sendo apenas o placeholder criado pelo npm. Vamos configurá-lo quando prepararmos os testes automatizados.

O arquivo `src/server.js` é o ponto de entrada que inicia o servidor; o campo `main` e os scripts apontam para esse caminho.

## Decisão técnica — Usar `import`/`export` (ESM)

Foi escolhida a sintaxe moderna de módulos JavaScript e a configuração já foi alterada em `backend/package.json` para `"type": "module"`:

```js
import express from 'express';
export default app;
```

Para que o Node.js interprete arquivos `.js` com essa sintaxe, `backend/package.json` precisa usar `"type": "module"` em vez de `"type": "commonjs"`. Depois da alteração, manteremos o padrão ESM em todos os arquivos e não misturaremos `require`/`module.exports` com `import`/`export`.

Com `"type": "module"`, o Node.js interpreta os arquivos `.js` do pacote como ESM. O arquivo `src/app.js` está sendo escrito com `import`/`export`; o exemplo anterior com `require` e `module.exports` não deve ser usado.

## Etapa 6 — Configurar a aplicação Express (`src/app.js`)

Foi criado `backend/src/app.js` com:

```js
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    banco: 'nao-configurado',
  });
});

export default app;
```

Esse arquivo configura a aplicação, mas ainda não abre uma porta de rede:

- `express()` cria a aplicação.
- `cors()` e `express.json()` são middlewares, isto é, funções que participam do processamento das requisições.
- `GET /api/health` é a rota de verificação da API. O campo `banco` informa que a conexão ao banco ainda não foi implementada.
- `export default app` permite importar a aplicação em outro módulo.

O arquivo `src/server.js`, descrito a seguir, inicia o servidor HTTP e o coloca em escuta numa porta.

## Etapa 7 — Criar o ponto de entrada do servidor (`src/server.js`)

Foi criado `backend/src/server.js`:

```js
import app from './app.js';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

- `import app from './app.js'` importa a aplicação Express. Em ESM, o caminho relativo inclui a extensão `.js`.
- `process.env.PORT` permite escolher a porta por variável de ambiente; `|| 3333` usa 3333 quando ela não foi definida.
- `app.listen(...)` inicia o servidor HTTP.
- A função passada como segundo argumento é executada quando o servidor começa a escutar, imprimindo uma confirmação no terminal.

O arquivo está criado. Ainda não temos confirmação registrada de que `npm run dev` foi executado ou que `GET /api/health` respondeu; esses são os próximos testes.

## Estado atual

- As pastas `backend/`, `frontend/` e `history/` existem na raiz.
- `backend/package.json` foi inicializado.
- O campo `main` e os scripts de inicialização foram configurados em `backend/package.json`.
- `backend/package.json` está configurado com `"type": "module"` para usar ESM.
- As pastas de trabalho do backend foram criadas.
- As dependências iniciais da API e a ferramenta `nodemon` foram instaladas.
- `backend/src/app.js` configura Express e a rota `GET /api/health`.
- `backend/src/server.js` foi criado para iniciar o servidor na porta 3333 (ou na porta definida em `PORT`).
- Ainda falta confirmar a inicialização com `npm run dev` e testar `GET /api/health`.
- Ainda não conectamos o PostgreSQL.
- As rotas, a autenticação e os dados da aplicação ainda não foram implementados.

## Próximas etapas

1. Executar `npm run dev` no terminal integrado do VS Code e testar `GET /api/health`, por exemplo no navegador. O estudante executará os comandos; o resultado será registrado aqui após a verificação.
2. Inicializar o Git na raiz do monorepo para que `backend/`, `frontend/`, `history/`, `docs/` e `specs/` pertençam ao mesmo repositório.

## Etapa 8 — Preparar o `.gitignore` do monorepo

Foi criado `.gitignore` na raiz do projeto para excluir arquivos que não devem ser versionados:

```gitignore
# Dependências Node.js em qualquer subprojeto
node_modules/

# Configurações locais e segredos
.env
.env.*
!.env.example

# Arquivos gerados e do sistema operacional
coverage/
dist/
.DS_Store
npm-debug.log*
```

A regra `node_modules/` vale em qualquer nível, então ignora tanto `backend/node_modules/` como a futura `frontend/node_modules/`. Arquivos `.env` locais também são ignorados para evitar versionar configurações e segredos; `.env.example` permanece incluível como modelo. `package-lock.json` não é ignorado, pois deve ser versionado para registrar as versões exatas resolvidas pelo npm.

O `.gitignore` está criado. O Git ainda não foi inicializado; isso será feito na raiz do monorepo no próximo passo.
