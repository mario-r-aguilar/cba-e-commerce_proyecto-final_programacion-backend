import { chatModel } from './models/chat.model.js';
import { devLogger } from '../../utils/logger.js';

export default class ChatMongoDAO {
	constructor() {
		this.model = chatModel;
	}

	/**
	 * Busca el listado de mensajes
	 * @returns {Array} Listado de mensajes
	 */
	async get() {
		try {
			return await this.model.find().limit(15).lean().exec();
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the messages.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Busca un mensaje mediante su ID
	 * @param {String} ID del mensaje
	 * @returns {Object} Mensaje
	 */
	async getById(messageID) {
		try {
			return await this.model.findById(messageID);
		} catch (error) {
			devLogger.fatal(
				`Unable to get the message.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Agrega un mensaje
	 * @param {Object} Mensaje
	 * @returns {Object} Mensaje creado
	 */
	async add(newMessage) {
		try {
			return await this.model.create(newMessage);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to send the message.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Elimina un mensaje
	 * @param {String} ID del mensaje
	 * @returns {@type void}
	 */
	async delete(messageID) {
		try {
			return await this.model.deleteOne({ _id: messageID });
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the message.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza un mensaje
	 * @param {String} ID del mensaje
	 * @param {Object} Mensaje editado
	 * @returns {Object} Mensaje actualizado
	 */
	async update(messageID, messageUpdated) {
		try {
			return await this.model.updateOne(
				{ _id: messageID },
				{ $set: messageUpdated }
			);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the message.\n 
				Error: ${error}`
			);
			return;
		}
	}
}
