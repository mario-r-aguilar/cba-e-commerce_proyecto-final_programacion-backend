import { devLogger } from '../utils/logger.js';

export default class ChatRepository {
	constructor(dao) {
		this.dao = dao;
	}

	/**
	 * Busca el listado de mensajes
	 * @returns {Array} Listado de mensajes
	 */
	async getMessages() {
		try {
			return await this.dao.get();
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the messages.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Crea un mensaje
	 * @param {Object} Mensaje
	 * @returns {Object} Mensaje creado
	 */
	async createMessage(newMessage) {
		try {
			return await this.dao.add(newMessage);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to send the message.\n 
				Error: ${error}`
			);
			return;
		}
	}
}
