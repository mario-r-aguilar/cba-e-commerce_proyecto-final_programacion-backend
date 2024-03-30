import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { devLogger } from '../../utils/logger.js';
import ProductDAOInterface from '../productDaoInterface.js';

export default class ProductFileDAO extends ProductDAOInterface {
	constructor() {
		super();
		this.path = './src/DAO/file/db/products.json';

		// Si el usuario no brinda una ruta, crea el archivo
		if (!fs.existsSync(this.path)) {
			fs.writeFileSync(this.path, JSON.stringify([]));
		}
	}

	/**
	 * Busca el listado de productos y permite limitar la cantidad de productos por pantalla
	 * @param {Number} Cantidad de productos por pantalla
	 * @param {Number} Número de página (solo para persistencia MONGO)
	 * @param {Number} Ordenar por precio de producto (solo para persistencia MONGO)
	 * @param {String} Categoría del producto (solo para persistencia MONGO)
	 * @param {Boolean} Disponibilidad del producto (solo para persistencia MONGO)
	 * @param {String} Nombre del producto (solo para persistencia MONGO)
	 * @returns {Array} Listado de productos
	 */
	async get(
		limit,
		page = null,
		sort = null,
		category = null,
		status = null,
		title = null
	) {
		try {
			let productList = await fs.promises.readFile(this.path, 'utf-8');
			productList = JSON.parse(productList);
			if (limit) {
				const productsLimited = productList.slice(0, limit);
				return productsLimited;
			} else {
				return productList;
			}
		} catch (error) {
			devLogger.fatal(
				`Products cannot be displayed.\n 
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
			const productList = await this.get();

			const productSearch = productList.find(
				(product) => product._id === productID
			);

			if (productSearch) {
				devLogger.info('Product found!');
				return productSearch;
			} else {
				devLogger.error(`ID ${productID} not found`);
				return null;
			}
		} catch (error) {
			devLogger.fatal(
				`Product cannot be displayed. \n 
            Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Agrega un nuevo producto
	 * @param {Object} Producto
	 * @returns {Object} Producto creado
	 */
	async add(newProduct) {
		try {
			const {
				title,
				description,
				code,
				price,
				status,
				stock,
				category,
				owner,
				thumbnail,
			} = newProduct;

			if (
				!title ||
				!description ||
				!code ||
				!price ||
				!status ||
				!stock ||
				!category ||
				!owner ||
				!thumbnail
			)
				return devLogger.error(
					'There are missing fields to complete. They are all mandatory'
				);

			if (
				typeof title !== 'string' ||
				typeof description !== 'string' ||
				typeof code !== 'string' ||
				typeof price !== 'number' ||
				typeof status !== 'boolean' ||
				typeof stock !== 'number' ||
				typeof category !== 'string' ||
				typeof owner !== 'string' ||
				!Array.isArray(thumbnail)
			) {
				return devLogger.error(
					'One or more fields have invalid data types'
				);
			}

			const productList = await this.get();

			if (productList.some((product) => product.code === code))
				return devLogger.error(
					`The code ${code} already exists. Try another code`
				);

			const _id = uuidv4();
			const newProductWithID = {
				_id,
				title,
				description,
				code,
				price,
				status: true,
				stock,
				category,
				owner,
				thumbnail,
			};

			productList.push(newProductWithID);

			await fs.promises.writeFile(this.path, JSON.stringify(productList));

			devLogger.info(`The product ${title} was successfully added`);
			return newProductWithID;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to add the product. \n 
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
			const productList = await this.get();
			// Crea un nuevo listado sin el producto cuya id se ingreso
			const newProductList = productList.filter(
				(product) => product._id != productID
			);

			await fs.promises.writeFile(this.path, JSON.stringify(newProductList));

			devLogger.info(`The product ID ${productID} was removed`);
			return;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the product. \n 
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
			const productList = await this.get();
			const productIndex = productList.findIndex(
				(product) => product._id === productID
			);

			if (productIndex === -1) {
				devLogger.error(`Product ID ${productID} not found`);
				return null;
			}

			const updatedProduct = {
				...productList[productIndex],
				...productUpdated,
			};

			productList[productIndex] = updatedProduct;

			await fs.promises.writeFile(this.path, JSON.stringify(productList));

			devLogger.info(`The product ID ${productID} was updated`);
			return updatedProduct;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the product.\n 
				Error: ${error}`
			);
			return null;
		}
	}
}
