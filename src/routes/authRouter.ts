import express from 'express';
import eah from 'express-async-handler';
import {
    getMe,
    logIn, logout,
    refresh,
    register,
} from '../controllers/authController';
import {authorizeUser} from "../middlewares/authMiddleware";
import {validateRequest} from "../middlewares/validationMiddleware";
import { registrationRequestBodyInfo } from '../validation/authController/registrationRequestBodyInfo';
import {logoutRequestQueryInfo} from "../validation/authController/logoutRequestQueryInfo";

export const authRouter = express.Router();

authRouter.post('/signin', eah(logIn));

authRouter.post('/signup', eah(validateRequest(registrationRequestBodyInfo)), eah(register));

authRouter.post('/refresh', eah(refresh));

authRouter.use(eah(authorizeUser));

authRouter.get('/info', eah(getMe));

authRouter.get('/logout', eah(validateRequest(null, {query: logoutRequestQueryInfo})), eah(logout));
