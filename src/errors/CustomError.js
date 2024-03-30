import EnumsError from './enumsError.js';
import { productCreationErrorInfo } from './infoErrors.js';

export default class CustomError {
	static createError({ name = 'Error', cause, message, code }) {
		const error = new Error(message, { cause });

		error.name = name;
		error.code = code;
		throw error;
	}

	static createProductError(product) {
		CustomError.createError({
			name: 'Product creation error',
			cause: productCreationErrorInfo(product),
			message: 'Error trying to create product',
			code: EnumsError.ERROR_IN_PRODUCT_CREATION,
		});
	}
}
