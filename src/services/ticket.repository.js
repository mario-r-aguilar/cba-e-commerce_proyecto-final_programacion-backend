import nodemailer from 'nodemailer';
import config from '../config/config.js';
import { devLogger } from '../utils/logger.js';

export default class TicketRepository {
	constructor(dao) {
		this.dao = dao;
	}

	/**
	 * Busca el listado de tickets
	 * @returns {Array} Listado de tickets
	 */
	async getTickets() {
		try {
			return await this.dao.get();
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
	async getTicketById(ticketID) {
		try {
			return await this.dao.getById(ticketID);
		} catch (error) {
			devLogger.fatal(
				`Unable to get the ticket.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Agrega un ticket
	 * @param {Object} Ticket
	 * @returns {Object} Ticket creado
	 */
	async addTicket(newTicket) {
		try {
			return await this.dao.add(newTicket);
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
	async deleteTicket(ticketID) {
		try {
			return await this.dao.delete(ticketID);
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
	async updateTicket(ticketID, ticketUpdated) {
		try {
			return await this.dao.update(ticketID, ticketUpdated);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the ticket.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Envía un mail con los detalles del ticket al usuario
	 * @param {Object} Ticket a enviar
	 * @param {String} Email del usuario
	 * @returns {Object} Detalles del mail enviado
	 */
	async sendTicketByMail(ticket, email, soldProducts, unsoldProducts) {
		const transport = nodemailer.createTransport({
			service: 'gmail',
			port: 587,
			auth: {
				user: config.nodemailerUser,
				pass: config.nodemailerPass,
			},
		});

		try {
			let soldProductsHTML = '';
			let unsoldProductsHTML = '';

			// HTML para productos con stock
			if (soldProducts.length > 0) {
				soldProductsHTML += '<h4>Productos vendidos:</h4>';
				soldProducts.forEach((product) => {
					soldProductsHTML += `<p>${product}</p>`;
				});
			}

			// HTML para productos sin stock
			if (unsoldProducts.length > 0) {
				unsoldProductsHTML += '<h4>Productos sin stock:</h4>';
				unsoldProducts.forEach((product) => {
					unsoldProductsHTML += `<p>${product}</p>`;
				});
			}

			const detailPurchase = await transport.sendMail({
				from: 'Cba E-commerce <config.nodemailerUser>',
				to: email,
				subject: 'Ticket de compra',
				html: `
					<h3>Muchas Gracias por su Compra!</h3>	
					<p><b>Total: $${ticket.amount}</b></p>
	 				<p><b>Comprador: ${ticket.purchaser}</b></p>
					<p><b>Fecha de compra: ${ticket.purchase_datetime}</b></p>
					<p><b>Nº de Ticket: ${ticket.code}</b></p>
					${soldProductsHTML}
					${unsoldProductsHTML}
				`,
			});
			return detailPurchase;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to send the ticket.\n 
				Error: ${error}`
			);
		}
	}
}
