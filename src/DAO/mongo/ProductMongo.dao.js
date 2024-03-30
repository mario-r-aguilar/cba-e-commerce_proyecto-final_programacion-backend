import { productModel } from './models/product.model.js';
import { devLogger } from '../../utils/logger.js';
import ProductDAOInterface from '../productDaoInterface.js';

export default class ProductMongoDAO extends ProductDAOInterface {
	constructor() {
		super();
		this.model = productModel;
	}

	/**
	 * Busca el listado de productos y permite aplicar filtros
	 * @param {Number} Cantidad de productos por pantalla
	 * @param {Number} Número de página
	 * @param {Number} Ordenar por precio de producto
	 * @param {String} Categoría del producto
	 * @param {Boolean} Disponibilidad del producto
	 * @param {String} Nombre del producto
	 * @returns {Array} Listado de productos
	 */
	async get(limit = 10, page = 1, sort, category, status, title) {
		try {
			let query = {};

			if (title) {
				query.title = { $regex: title, $options: 'i' };
			}

			if (category) {
				query.category = category;
			}

			if (status) {
				query.status = status;
			}

			const options = {
				lean: true,
				page,
				limit,
			};

			if (sort) {
				options.sort = { price: sort };
			}

			return await productModel.paginate(query, options);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the products.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Busca un producto mediante su ID
	 * @param {String} ID del producto
	 * @returns {Object} Producto
	 */
	async getById(productID) {
		try {
			return await this.model.findById(productID).lean().exec();
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the product.\n 
				Error: ${error}`
			);
			return null;
		}
	}

	/**
	 * Agrega un producto
	 * @param {Object} Producto
	 * @returns {Object} Producto creado
	 */
	async add(newProduct) {
		try {
			return await this.model.create(newProduct);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to add the product.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Elimina un producto
	 * @param {String} ID del producto
	 * @returns {@type void}
	 */
	async delete(productID) {
		try {
			return await this.model.deleteOne({ _id: productID });
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the product.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza un producto
	 * @param {String} ID del producto
	 * @param {Object} Producto editado
	 * @returns {Object} Producto actualizado
	 */
	async update(productID, productUpdated) {
		try {
			return await this.model.updateOne(
				{ _id: productID },
				{ $set: productUpdated } // $set: solo actualiza los campos que hayan cambiado
			);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the product.\n 
				Error: ${error}`
			);
			return;
		}
	}
}
