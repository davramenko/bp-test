import express from 'express';
import eah from 'express-async-handler';
import { authorizeUser } from '../middlewares/authMiddleware';
import { icmpPing, latency } from '../controllers/toolsController';
import { validateRequest } from '../middlewares/validationMiddleware';
import { LatencyRequestQueryInfo } from '../validation/authController/latencyRequestQueryInfo';

export const toolsRouter = express.Router();

toolsRouter.use(eah(authorizeUser));

toolsRouter.get('/latency', eah(validateRequest(null, { query: LatencyRequestQueryInfo })), eah(latency));

toolsRouter.get('/ping', eah(validateRequest(null, { query: LatencyRequestQueryInfo })), eah(icmpPing));
