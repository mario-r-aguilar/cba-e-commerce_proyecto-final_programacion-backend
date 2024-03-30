import { ProductService, TicketService } from '../services/index.js';
import { devLogger } from '../utils/logger.js';

export default class CartRepository {
	constructor(dao) {
		this.dao = dao;
	}

	/**
	 * Busca el listado de carritos
	 * @returns {Array} Listado de carritos
	 */
	async getCarts() {
		try {
			return await this.dao.get();
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
	async getCartById(cartID) {
		try {
			return await this.dao.getById(cartID);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to get the cart.\n 
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
	async addCart(newCart) {
		try {
			return await this.dao.add(newCart);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to add the cart.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Agrega un producto al carrito
	 * @param {String} ID del carrito
	 * @param {String} ID del producto
	 * @returns {Object} Carrito actualizado
	 */
	async addProductToCart(cartID, productID, user) {
		try {
			const cart = await this.getCartById(cartID);
			const product = await ProductService.getProductById(productID);

			if (!cart || !product || !user) {
				throw new Error(
					'The cart or the product or the user, does not exist'
				);
			}

			if (user.role === 'PREMIUM') {
				const validOwner = user.email === product.owner;
				if (validOwner) {
					devLogger.warning(
						'You cannot add products that were not created by you'
					);
					throw new Error(
						'You cannot add products that were not created by you'
					);
				}
			}

			const productExist = cart.products.find(
				// Iguala el tipo de valor de la ID convirtiéndolos a string
				(item) => String(item.product._id) === String(productID)
			);

			// Si el producto existe incrementa su cantidad
			if (productExist) {
				productExist.quantity++;
			} else {
				cart.products.push({ product: product._id });
			}

			const updatedCart = await this.dao.update(cartID, cart);
			return updatedCart;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to add the product to the cart.\n 
				Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Elimina un producto del carrito
	 * @param {String} ID del carrito
	 * @param {String} ID del producto
	 * @returns {Object} Carrito actualizado
	 */
	async deleteOneProductfromCart(cartID, productID) {
		try {
			const cart = await this.getCartById(cartID);
			const product = await ProductService.getProductById(productID);

			if (!cart || !product) {
				throw new Error('The cart and/or the product does not exist');
			}

			const productIndex = cart.products.findIndex(
				(item) => String(item.product._id) === String(productID)
			);

			if (productIndex !== -1) {
				cart.products.splice(productIndex, 1);
			} else {
				throw new Error('The product was not found in the cart.');
			}

			const updatedCart = await this.dao.update(cartID, cart);
			return updatedCart;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to remove the product from the cart.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza todo el contenido de un carrito
	 * @param {String} ID del carrito
	 * @param {Object} Lista completa que se obtiene de un getProducts()
	 * @returns {Object} Carrito actualizado
	 */
	async updateAllProductsOfCart(cartID, newProductList) {
		try {
			const cart = await this.getCartById(cartID);

			if (!cart) {
				throw new Error('The cart does not exist');
			}

			// Valida si es un array y no esté vacío
			if (
				!Array.isArray(newProductList.payload.docs) ||
				newProductList.payload.docs.length === 0
			) {
				throw new Error('The new product listing is invalid or empty');
			}

			// Actualiza los productos del carrito con la nueva lista
			cart.products = newProductList.payload.docs.map((product) => ({
				product: product._id,
				quantity: 1, // Asigno la cantidad inicial del producto
			}));

			const updatedCart = await this.dao.update(cartID, cart);
			return updatedCart;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the products in the cart.\n 
					Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza la cantidad de un producto que se encuentra en el carrito
	 * @param {String} ID del carrito
	 * @param {String} ID del producto
	 * @param {Number} Nueva cantidad del producto
	 * @returns {Object} Carrito actualizado
	 */
	async updateQuantityOfProduct(cartID, productID, newQuantity) {
		try {
			const cart = await this.getCartById(cartID);
			const product = await ProductService.getProductById(productID);

			if (!cart || !product) {
				throw new Error('The cart and/or the product does not exist');
			}

			const productExistInCart = cart.products.find(
				(item) => String(item.product._id) === String(productID)
			);

			// Almaceno el valor de la nueva cantidad
			if (productExistInCart) {
				const parsedQuantity = newQuantity.quantity;

				// Convierto la cantidad a número y la actualizo en el producto
				if (!isNaN(parsedQuantity)) {
					productExistInCart.quantity = parsedQuantity;
				} else {
					throw new Error('The value provided is not a valid number');
				}
			} else {
				throw new Error('The product is not in the cart');
			}

			const updatedCart = await this.dao.update(cartID, cart);
			return updatedCart;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the product quantity.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Elimina todos los productos del carrito
	 * @param {String} ID del carrito
	 * @returns {Object} Carrito actualizado
	 */
	async deleteAllProductsfromCart(cartID) {
		try {
			const cart = await this.getCartById(cartID);

			if (!cart) {
				throw new Error('The cart does not exist');
			}

			cart.products = [];

			const updatedCart = await this.dao.update(cartID, cart);
			return updatedCart;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to remove products from the cart.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Calcula el precio total de la compra para generar la orden de pago en Mercado Mercado Pago
	 * @param {String} ID del carrito
	 * @returns {Object} Detalle de productos con y sin stock junto al precio total de la compra de productos con stock
	 */
	async calculatePurchase(cartID) {
		try {
			const cart = await this.getCartById(cartID);
			let productStockOk = [];
			let productStockNone = [];
			let totalPricePurchase = 0;

			// Cálculo de productos con y sin stock
			for (const productInCart of cart.products) {
				let product = await ProductService.getProductById(
					productInCart.product._id
				);

				if (product.stock < productInCart.quantity) {
					productStockNone.push(product);
				} else {
					product.price *= productInCart.quantity;
					totalPricePurchase += product.price;
					productStockOk.push(product);
				}
			}

			return { totalPricePurchase };
		} catch (error) {
			devLogger.fatal(
				`it is not possible to calculate the purchase.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Completa el proceso de la compra y muestra el detalle de la misma
	 * @param {String} ID del carrito
	 * @param {Object} Usuario
	 * @returns {Object} Detalle de la compra
	 */
	async purchaseProductsInCart(cartID, user) {
		try {
			const cart = await this.getCartById(cartID);
			let productStockOk = [];
			let productStockNone = [];
			let ticket = null;
			let soldProducts = [];
			let unsoldProducts = [];

			// Manejo de stock y carrito resultante
			for (const productInCart of cart.products) {
				let product = await ProductService.getProductById(
					productInCart.product._id
				);

				if (product.stock < productInCart.quantity) {
					productStockNone.push(product);
					unsoldProducts.push(product.title);
				} else {
					product.stock -= productInCart.quantity;
					await ProductService.updateProduct(
						productInCart.product._id,
						product
					);
					product.price *= productInCart.quantity;
					productStockOk.push(product);
					await this.deleteOneProductfromCart(
						cartID,
						productInCart.product._id
					);
					soldProducts.push(product.title);
				}
			}

			// Generación de ticket para response
			let totalPricePurchase = productStockOk.reduce(
				(total, product) => total + product.price,
				0
			);

			const ticketData = {
				amount: totalPricePurchase,
				purchaser: user.email,
			};

			if (ticketData.amount !== 0) {
				ticket = await TicketService.addTicket(ticketData);
				await TicketService.sendTicketByMail(
					ticket,
					user.email,
					soldProducts,
					unsoldProducts
				);
			}

			// Ids de productos sin stock para response
			let productStockNoneIDs = productStockNone.map((product) => {
				return product._id;
			});

			const payload = {
				status: 'success',
				ticket: ticket !== null ? ticket : 'ticket not generated',
				productsWithoutStock:
					productStockNoneIDs.length > 0 ? productStockNoneIDs : 'none',
			};
			return payload;
		} catch (error) {
			devLogger.fatal(
				`it is not possible to make the purchase.\n 
			Error: ${error}`
			);
			return;
		}
	}
}
