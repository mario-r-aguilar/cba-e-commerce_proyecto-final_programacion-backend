import fs from 'node:fs';
import { devLogger } from '../../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export default class TicketFileDAO {
	constructor() {
		this.path = './src/DAO/file/db/tickets.json';

		// Si el usuario no brinda una ruta, crea el archivo
		if (!fs.existsSync(this.path)) {
			fs.writeFileSync(this.path, JSON.stringify([]));
		}
	}

	/**
	 * Busca el listado de tickets
	 * @returns {Array} Listado de tickets
	 */
	async get() {
		try {
			const ticketList = await fs.promises.readFile(this.path, 'utf-8');
			return JSON.parse(ticketList);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the tickets.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Busca un ticket mediante su ID
	 * @param {String} ID del ticket
	 * @returns {Object} Ticket
	 */
	async getById(ticketID) {
		try {
			const ticketList = await this.get();
			const ticketSearch = ticketList.find(
				(ticket) => ticket._id === ticketID
			);

			if (ticketSearch) {
				devLogger.info('Ticket found!');
				return ticketSearch;
			} else {
				devLogger.error(`Ticket ID ${ticketID} not found`);
				return null;
			}
		} catch (error) {
			devLogger.fatal(
				`Unable to get the ticket.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Agrega un nuevo ticket
	 * @param {Object} Ticket
	 * @returns {Object} Ticket creado
	 */
	async add(newTicket) {
		try {
			const { code, purchase_datetime, amount, purchaser } = newTicket;

			if (!code || !purchase_datetime || !amount || !purchaser)
				return devLogger.error('Missing fields in ticket');

			const ticketList = await this.get();

			const _id = uuidv4();

			const newTicketWithID = {
				_id,
				code: 'TKT_' + uuidv4(),
				purchase_datetime: Date.now(),
				amount,
				purchaser,
			};
			ticketList.push(newTicketWithID);

			await fs.promises.writeFile(this.path, JSON.stringify(ticketList));

			devLogger.info(`The ticket was successfully added`);
			return newTicketWithID;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to create the ticket.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Elimina un ticket
	 * @param {String} ID del ticket
	 * @returns {@type void}
	 */
	async delete(ticketID) {
		try {
			const ticketList = await this.get();

			const ticketToDelete = ticketList.find(
				(ticket) => ticket._id === ticketID
			);
			if (!ticketToDelete) {
				devLogger.error(`Ticket ID ${ticketID} not found`);
				return null;
			}

			const newTicketList = ticketList.filter(
				(ticket) => ticket._id != ticketID
			);

			await fs.promises.writeFile(this.path, JSON.stringify(newTicketList));

			devLogger.info(`The ticket ID ${ticketID} was removed`);
			return;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the ticket.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza un ticket
	 * @param {String} ID del ticket
	 * @param {Object} Ticket editado
	 * @returns {Object} Ticket actualizado
	 */
	async update(ticketID, ticketUpdated) {
		try {
			const { code, purchase_datetime, amount, purchaser } = ticketUpdated;

			const ticketList = await this.get();

			const ticketToUpdate = ticketList.find(
				(ticket) => ticket._id === ticketID
			);
			if (!ticketToUpdate) {
				devLogger.error(`Ticket ID ${ticketID} not found`);
				return null;
			}

			const updatedTicketList = ticketList.map((ticket) => {
				if (ticket._id === ticketID) {
					return {
						...ticket,
						code,
						purchase_datetime,
						amount,
						purchaser,
					};
				} else {
					return ticket;
				}
			});

			const updatedTicket = updatedTicketList.find(
				(ticket) => ticket._id === ticketID
			);

			await fs.promises.writeFile(
				this.path,
				JSON.stringify(updatedTicketList)
			);

			devLogger.info(`The ticket ID ${ticketID} was updated`);
			return updatedTicket;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the ticket.\n 
				Error: ${error}`
			);
			return;
		}
	}
}
