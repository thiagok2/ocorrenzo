import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import autenticar from '../middlewares/autenticar.js';
import validar from '../middlewares/validar.js';
import { esquemaLogin } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 10, // suíte de testes faz muitos logins; limite real só vale fora de test

  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ codigo: 'MUITAS_TENTATIVAS', mensagem: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }),
});

router.post('/login', limitarLogin, validar(esquemaLogin), authController.login); // R02
router.get('/me', autenticar, authController.me); // R03

export default router;
