import { Router } from 'express';
import passport from 'passport';
import {
	getProducts,
	getProductById,
	addProduct,
	updateProduct,
	deleteProduct,
} from '../controllers/product.controller.js';

const productRouter = Router();

productRouter.get(
	'/',
	passport.authenticate('current', { session: false }),
	getProducts
);

productRouter.get(
	'/:pid',
	passport.authenticate('current', { session: false }),
	getProductById
);

productRouter.post(
	'/',
	passport.authenticate('current', { session: false }),
	addProduct
);

productRouter.put(
	'/:pid',
	passport.authenticate('current', { session: false }),
	updateProduct
);

productRouter.delete(
	'/:pid',
	passport.authenticate('current', { session: false }),
	deleteProduct
);

export { productRouter };
