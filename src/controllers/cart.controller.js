import { CartService } from '../services/index.js';
import UserDTO from '../DTO/user.dto.js';

// Muestra el listado de carritos
export const getCarts = async (req, res) => {
	try {
		const carts = await CartService.getCarts();
		res.status(200).send(carts);
	} catch (error) {
		req.logger.fatal('Could not get cart list');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Muestra un carrito según la id enviada por req.params
export const getCartById = async (req, res) => {
	try {
		let { cid } = req.params;
		const cart = await CartService.getCartById(cid);
		res.status(200).send(cart);
	} catch (error) {
		req.logger.fatal('Could not get cart');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Agrega un nuevo carrito enviado desde req.body
export const addCart = async (req, res) => {
	try {
		let newCart = req.body;
		res.status(201).send(await CartService.addCart(newCart));
	} catch (error) {
		req.logger.fatal('Could not add cart');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Agrega un producto a un carrito usando las IDs envíadas por req.params
export const addProductToCart = async (req, res) => {
	try {
		const userData = req.session.user;
		const user = new UserDTO(userData);

		let { cid } = req.params;
		let { pid } = req.params;

		res.status(201).send(await CartService.addProductToCart(cid, pid, user));
	} catch (error) {
		req.logger.fatal('Could not add product to cart');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Elimina un producto de un carrito
export const deleteOneProductfromCart = async (req, res) => {
	try {
		let { cid } = req.params;
		let { pid } = req.params;
		res.status(204).send(
			await CartService.deleteOneProductfromCart(cid, pid)
		);
	} catch (error) {
		req.logger.fatal('Could not remove product from cart');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Actualiza el contenido completo de un carrito usando el objeto completo que devuelve getProducts()
export const updateAllProductsOfCart = async (req, res) => {
	try {
		let { cid } = req.params;
		let newProductList = req.body;
		res.status(200).send(
			await CartService.updateAllProductsOfCart(cid, newProductList)
		);
	} catch (error) {
		req.logger.fatal('Could not update all products in cart');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Actualiza la cantidad de un producto que se encuentra en un carrito
export const updateQuantityOfProduct = async (req, res) => {
	try {
		let { cid } = req.params;
		let { pid } = req.params;
		let newQuantity = req.body;
		res.status(200).send(
			await CartService.updateQuantityOfProduct(cid, pid, newQuantity)
		);
	} catch (error) {
		req.logger.fatal('Product quantity could not be updated');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Elimina todos los productos que se encuentran en un carrito
export const deleteAllProductsfromCart = async (req, res) => {
	try {
		let { cid } = req.params;
		res.status(204).send(await CartService.deleteAllProductsfromCart(cid));
	} catch (error) {
		req.logger.fatal('Could not empty cart');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Finaliza la compra de los productos que se encuentran en un carrito
export const purchaseProductsInCart = async (req, res) => {
	try {
		let { cid } = req.params;
		const userData = req.session.user;
		const user = new UserDTO(userData);

		if (!userData) {
			return res.status(401).send({
				status: 'error',
				message: 'unauthorized: you are not logged in',
			});
		}

		await CartService.purchaseProductsInCart(cid, user);

		res.status(200).redirect(`/carts/${cid}`);
	} catch (error) {
		req.logger.fatal('The purchase of the products could not be made');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};
