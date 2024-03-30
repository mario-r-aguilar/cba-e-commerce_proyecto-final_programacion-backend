import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { devLogger } from '../../utils/logger.js';

export default class CartFileDAO {
	constructor() {
		this.path = './src/DAO/file/db/carts.json';

		// Si el usuario no brinda una ruta, crea el archivo
		if (!fs.existsSync(this.path)) {
			fs.writeFileSync(this.path, JSON.stringify([]));
		}
	}

	/**
	 * Busca el listado de carritos
	 * @returns {Array} Listado de carritos
	 */
	async get() {
		try {
			const cartsList = await fs.promises.readFile(this.path, 'utf-8');
			if (!cartsList) {
				devLogger.error('The file is empty.');
				return null;
			}
			return JSON.parse(cartsList);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the carts.\n 
            Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Busca un carrito mediante su ID
	 * @param {String} ID del carrito
	 * @returns {Object} Carrito
	 */
	async getById(cartID) {
		try {
			const cartsList = await this.get();
			const cartSearch = cartsList.find((cart) => cart._id === cartID);

			if (cartSearch) {
				devLogger.info('Cart found!');
				return cartSearch;
			} else {
				devLogger.error(`Cart ID ${cartID} not found`);
				return null;
			}
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the cart. \n 
            Error: ${error}`
			);
			return;
		}
	}

	async add(newCart) {
		try {
			const { products } = newCart;
			if (!products) return devLogger.error('Products element is missing');

			const cartsList = await this.get();

			const _id = uuidv4();
			const newCartWithID = {
				_id,
				products: products.map((product) => ({
					product: product._id,
					quantity: product.quantity || 1,
				})),
			};

			cartsList.push(newCartWithID);

			await fs.promises.writeFile(this.path, JSON.stringify(cartsList));

			devLogger.info(`The cart was successfully added`);
			return newCartWithID;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to add the cart. \n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Elimina un carrito
	 * @param {String} ID del carrito
	 * @returns {@type void}
	 */
	async delete(cartID) {
		try {
			const cartList = await this.get();
			const newCartList = cartList.filter((cart) => cart._id != cartID);

			await fs.promises.writeFile(this.path, JSON.stringify(newCartList));

			devLogger.info(`The cart ID ${cartID} was removed`);
			return;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the cart.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza un carrito
	 * @param {String} ID del carrito
	 * @param {Object} Carrito editado
	 * @returns {Object} Carrito actualizado
	 */
	async update(cartID, cartUpdated) {
		try {
			const { products } = cartUpdated;

			const cartList = await this.get();

			const updatedCartList = cartList.map((cart) => {
				if (cart._id === cartID) {
					return {
						...cart,
						products,
					};
				} else {
					return cart;
				}
			});

			const updatedCart = updatedCartList.find(
				(cart) => cart._id === cartID
			);

			await fs.promises.writeFile(
				this.path,
				JSON.stringify(updatedCartList)
			);

			devLogger.info(`The cart ID ${cartID} was updated`);
			return updatedCart;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the cart.\n 
				Error: ${error}`
			);
			return;
		}
	}
}
