import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'products';
const productSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	code: { type: String, required: true, unique: true },
	price: { type: Number, required: true },
	status: { type: Boolean, required: true, default: true },
	stock: { type: Number, required: true },
	category: { type: String, required: true },
	owner: { type: String, required: false, default: 'admin' },
	thumbnail: { type: Array, required: false, default: [] },
});

productSchema.plugin(mongoosePaginate); // realiza una paginación de los productos

export const productModel = mongoose.model(productCollection, productSchema);
