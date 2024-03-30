import { cartModel } from './models/cart.model.js';
import { devLogger } from '../../utils/logger.js';

export default class CartMongoDAO {
	constructor() {
		this.model = cartModel;
	}

	/**
	 * Busca el listado de carritos
	 * @returns {Array} Listado de carritos
	 */
	async get() {
		try {
			return await this.model.find().lean().exec();
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
			return await this.model
				.findOne({ _id: cartID })
				.populate('products.product')
				.lean()
				.exec();
		} catch (error) {
			devLogger.fatal(
				`Unable to get cart.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Agrega un carrito
	 * @param {Object} Carrito
	 * @returns {Object} Carrito creado
	 */
	async add(newCart) {
		try {
			return await this.model.create(newCart);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to add the cart.\n 
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
			return await this.model.deleteOne({ _id: cartID });
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
			return await this.model.updateOne(
				{ _id: cartID },
				{ $set: cartUpdated }
			);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the cart.\n 
				Error: ${error}`
			);
			return;
		}
	}
}
