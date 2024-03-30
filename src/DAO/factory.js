import config from '../config/config.js';
import selectedPersistence from '../config/persistence.js';
import mongoose from 'mongoose';
import { devLogger } from '../utils/logger.js';

// Nombres de los daos para usar por los services
export let Product;
export let Cart;
export let User;
export let Chat;
export let Ticket;

// Patrón fábrica para el uso de los daos según la persistencia seleccionada
switch (selectedPersistence.persistence) {
	case 'MONGO':
		try {
			let dbSelected =
				config.modeTest === 'No' ? config.mongoDbName : config.mongoDbTest;

			if (config.modeTest === 'Yes') {
				devLogger.info('Test Mode Activated');
			} else {
				devLogger.info('Test Mode Disabled');
			}

			mongoose
				.connect(config.mongoUrl, { dbName: dbSelected })
				.then(() => {
					if (config.modeTest === 'Yes') {
						mongoose.connection.collections.users.drop();
						mongoose.connection.collections.carts.drop();
						devLogger.info('Mongo Test DB reset and connected');
					} else {
						devLogger.info('Mongo DB connected');
					}
				})
				.catch((error) => {
					devLogger.error(
						'No es posible conectarse a la base de datos',
						error
					);
				});

			// importe dinámico de daos de mongo
			const { default: ProductMongo } = await import(
				'./mongo/ProductMongo.dao.js'
			);
			const { default: CartMongo } = await import(
				'./mongo/CartMongo.dao.js'
			);
			const { default: UserMongo } = await import(
				'./mongo/UserMongo.dao.js'
			);
			const { default: ChatMongo } = await import(
				'./mongo/ChatMongo.dao..js'
			);
			const { default: TicketMongo } = await import(
				'./mongo/TicketMongo.dao.js'
			);

			Product = ProductMongo;
			Cart = CartMongo;
			User = UserMongo;
			Chat = ChatMongo;
			Ticket = TicketMongo;
		} catch (error) {
			selectedPersistence.error('Persistence not available', error);
		}

		break;

	case 'FILE':
		try {
			devLogger.info('File DB connected');

			// importe dinámico de daos de file
			const { default: ProductFile } = await import(
				'./file/ProductFile.dao.js'
			);
			const { default: CartFile } = await import('./file/CartFile.dao.js');
			const { default: UserFile } = await import('./file/UserFile.dao.js');
			const { default: ChatFile } = await import('./file/ChatFile.dao.js');
			const { default: TicketFile } = await import(
				'./file/TicketFile.dao.js'
			);

			Product = ProductFile;
			Cart = CartFile;
			User = UserFile;
			Chat = ChatFile;
			Ticket = TicketFile;
		} catch (error) {
			selectedPersistence.error('Persistence not available', error);
		}

		break;

	default:
		throw new Error('Persistence not configured');
}
