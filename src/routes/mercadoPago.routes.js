import { Router } from 'express';
import passport from 'passport';
import {
	createOrderMP,
	getPublicKey,
} from '../controllers/mercadoPago.controller.js';

const mercadoPagoRouter = Router();

mercadoPagoRouter.get(
	'/publicKey',
	passport.authenticate('current', { session: false }),
	getPublicKey
);

mercadoPagoRouter.post(
	'/createorder/:cid',
	passport.authenticate('current', { session: false }),
	createOrderMP
);

export { mercadoPagoRouter };
