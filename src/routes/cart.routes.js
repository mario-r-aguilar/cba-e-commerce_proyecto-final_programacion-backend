import { Router } from 'express';
import passport from 'passport';
import { roleControl } from '../middlewares/roleControl.middleware.js';
import {
	getCarts,
	getCartById,
	addCart,
	addProductToCart,
	deleteOneProductfromCart,
	updateAllProductsOfCart,
	updateQuantityOfProduct,
	deleteAllProductsfromCart,
	purchaseProductsInCart,
} from '../controllers/cart.controller.js';

const cartRouter = Router();

cartRouter.get(
	'/',
	passport.authenticate('current', { session: false }),
	getCarts
);

cartRouter.get(
	'/:cid',
	passport.authenticate('current', { session: false }),
	getCartById
);

cartRouter.post(
	'/',
	passport.authenticate('current', { session: false }),
	addCart
);

cartRouter.post(
	'/:cid/products/:pid',
	passport.authenticate('current', { session: false }),
	roleControl('USER', 'PREMIUM'),
	addProductToCart
);

cartRouter.delete(
	'/:cid/products/:pid',
	passport.authenticate('current', { session: false }),
	deleteOneProductfromCart
);

cartRouter.put(
	'/:cid',
	passport.authenticate('current', { session: false }),
	updateAllProductsOfCart
);

cartRouter.put(
	'/:cid/products/:pid',
	passport.authenticate('current', { session: false }),
	updateQuantityOfProduct
);

cartRouter.delete(
	'/:cid',
	passport.authenticate('current', { session: false }),
	deleteAllProductsfromCart
);

cartRouter.get(
	'/:cid/purchase',
	passport.authenticate('current', { session: false }),
	purchaseProductsInCart
);

export { cartRouter };
