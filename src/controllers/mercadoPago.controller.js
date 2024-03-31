import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CartService } from '../services/index.js';
import config from '../config/config.js';

const client = new MercadoPagoConfig({ accessToken: config.mpAccessToken });

export const getPublicKey = async (req, res) => {
	try {
		const publicKey = JSON.stringify(config.mpPublicKey);

		req.logger.info(`Public key obtain`);
		res.status(200).send(publicKey);
	} catch (error) {
		req.logger.fatal('It is not possible to obtain the public key.');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

export const createOrderMP = async (req, res) => {
	try {
		const { cid } = req.params;
		const result = await CartService.calculatePurchase(cid);

		if (result.totalPricePurchase === 0) {
			return res.status(400).send('The selected products are out of stock.');
		}

		const body = {
			items: [
				{
					title: 'Compra en Cba E-commerce',
					quantity: 1,
					unit_price: Number(result.totalPricePurchase),
					currency_id: 'ARS',
				},
			],
			back_urls: {
				success: `${config.serverUrl}/api/carts/${cid}/purchase`,
				failure: `${config.serverUrl}/paymentfailure`,
				pending: `${config.serverUrl}/paymentpending`,
			},
			auto_return: 'approved',
		};

		const preference = new Preference(client);
		const resultPreference = await preference.create({ body });

		req.logger.info(`Created preference id`);
		res.status(201).send({ id: resultPreference.id });
	} catch (error) {
		req.logger.fatal('It is not possible to create order.');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};
