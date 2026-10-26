import express from 'express';
import cors from 'cors';
import rotas from './routes/index.js';
import tratarErros from './middlewares/erros.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', rotas);

app.use(tratarErros);

export default app;