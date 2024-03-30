import EnumsError from '../errors/enumsError.js';

export default (error, req, res, next) => {
	switch (error.code) {
		case EnumsError.ERROR_IN_PRODUCT_CREATION:
			res.status(400).send({
				status: 'error',
				error: error.name,
				cause: error.cause,
			});
			break;

		default:
			res.status(500).send({
				status: 'error',
				error: 'Internal Server Error',
			});
			break;
	}
};
