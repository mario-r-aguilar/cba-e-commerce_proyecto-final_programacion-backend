/* Clase padre de ProductMongoDAO y ProductFileDAO creada para evitar incompatibilidades 
entre la persistencia mongo y file por la forma de aplicar los filtros que posee cada una
en el método get() */
export default class ProductDAOInterface {
	async get(limit, page, sort, category, status, title) {}
	async getById(productID) {}
	async add(newProduct) {}
	async delete(productID) {}
	async update(productID, productUpdated) {}
}
