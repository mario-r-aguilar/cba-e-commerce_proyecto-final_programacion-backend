import { devLogger } from '../utils/logger.js';
import config from '../config/config.js';
import nodemailer from 'nodemailer';
import { createHash, checkPassword } from '../utils/utils.js';
import fs from 'node:fs';
import path from 'node:path';
import getDirname from '../utils/utils.js';
import UserPrincipalDataDTO from '../DTO/userPrincipalData.dto.js';

const __dirname = getDirname(import.meta.url);

export default class UserRepository {
	constructor(dao) {
		this.dao = dao;
	}

	/**
	 * Devuelve el listado de usuarios con sus datos principales
	 * @returns {Array} Listado de usuarios
	 */
	async getAll() {
		try {
			const usersData = await this.dao.get();
			const usersList = usersData.map((user) => {
				return new UserPrincipalDataDTO(user);
			});

			return usersList;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the users.\n 
				Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Busca un usuario mediante su ID
	 * @param {String} ID del usuario
	 * @returns {Object} Usuario
	 */
	async getUserById(userID) {
		try {
			return await this.dao.getById(userID);
		} catch (error) {
			devLogger.fatal(
				`Unable to get the user.\n 
					Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Busca un usuario mediante su email
	 * @param {String} Email del usuario
	 * @returns {Object} Usuario
	 */
	async getUserByEmail(userEmail) {
		try {
			return await this.dao.getByEmail(userEmail);
		} catch (error) {
			devLogger.fatal(
				`Unable to get the user.\n 
				Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Agrega un usuario
	 * @param {Object} Usuario
	 * @returns {Object} Usuario creado
	 */
	async addUser(newUser) {
		try {
			return await this.dao.add(newUser);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to create the user.\n 
				Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Elimina usuarios que hayan permanecido inactivos por más de dos días
	 * @returns Resultado de la eliminación de usuarios
	 */
	async deleteInactiveUsers() {
		try {
			// Para hacer pruebas con inactividad de 10 minutos (comentar la siguiente línea si no se usa)
			// const threshold = new Date(Date.now() - 10 * 60 * 1000);

			// Resta 2 días a la fecha actual para obtener la fecha de 2 días atrás (en milisegundos)
			const threshold = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

			const usersInactives = await this.dao.getByLastConnection(threshold);

			const deletionResult = await this.dao.delete({
				last_connection: { $lt: threshold },
			});

			const transport = nodemailer.createTransport({
				service: 'gmail',
				port: 587,
				auth: {
					user: config.nodemailerUser,
					pass: config.nodemailerPass,
				},
			});

			for (const user of usersInactives) {
				await transport.sendMail({
					from: 'Cba E-commerce <config.nodemailerUser>',
					to: user.email,
					subject: 'Información importante sobre tu cuenta',
					html: `
					<h3>Tu cuenta ha sido eliminada por inactividad</h3>
					<p><b>Hola ${user.name},</b> te informamos que tu cuenta ha sido eliminada por inactividad. 
					Si deseas seguir utilizando nuestros servicios, por favor vuelve a registrarte.
					Muchas gracias.</p>`,
				});
			}

			transport.close();

			// Elimina todo usuario cuya última conexión sea menor a la del límite establecido en threshold
			return deletionResult;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the inactive users.\n 
            Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Cambia el rol de USER a PREMIUM y viceversa
	 * @param {Object} Usuario
	 * @returns {void}
	 */
	async toggleUserRole(user) {
		try {
			let newRole;
			switch (user.role) {
				case 'PREMIUM':
					newRole = 'USER';
					break;

				case 'USER':
					newRole = 'PREMIUM';
					break;

				default:
					devLogger.warning(`Invalid role provided: ${user.role}`);
					throw new Error(`Invalid role provided: ${user.role}`);
			}

			// Realiza la actualización del rol solo si es USER o PREMIUM
			if (newRole) {
				devLogger.info(
					`El usuario ${user.name} ${user.lastname} cambió su rol a ${newRole}`
				);

				user.role = newRole;

				return await this.dao.update(user._id, user);
			}
		} catch (error) {
			devLogger.fatal(
				`It is not possible to change the user's role.\n
				Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Verifica si el usuario cuenta con los 3 documentos obligatorios
	 * @param {Object} Usuario
	 * @returns {Boolean} Resultado de la verificación
	 */
	async areDocumentsUploaded(user) {
		const requiredDocuments = [
			'personal-identification',
			'proof-of-address',
			'proof-of-account-status',
		];
		const uploadedDocuments = user.documents.map((doc) => doc.name);

		// Verifica si todos los documentos requeridos están presentes en los documentos subidos
		return requiredDocuments.every((document) =>
			uploadedDocuments.includes(document)
		);
	}

	/**
	 * Envía un link para reestablecer la contraseña
	 * @param {String} Email del usuario
	 * @param {String} Token
	 * @returns {String} Resultado del envío del correo
	 */
	async sendResetPassEmail(email, resetPassToken) {
		try {
			const resetLink = `${config.serverUrl}/reset-password/${resetPassToken}`;

			const transport = nodemailer.createTransport({
				service: 'gmail',
				port: 587,
				auth: {
					user: config.nodemailerUser,
					pass: config.nodemailerPass,
				},
			});

			await transport.sendMail({
				from: 'Cba E-commerce <config.nodemailerUser>',
				to: email,
				subject: 'Restablecer contraseña',
				html: `
				<h3>Para restablecer su contraseña haga clic aquí:</h3>
				<a href="${resetLink}" style="display: inline-block; padding:  10px  20px; background-color: #007BFF; color: white; text-decoration: none; border-radius:  4px; font-weight: bold;">
				Resetear Password
				</a>          
				<p><b>El enlace expirará en 1 hora.</b></p>`,
			});

			devLogger.info('The email to reset your password was sent');
			return 'Success';
		} catch (error) {
			devLogger.fatal(
				`It is not possible to send the email to reset the password (repository error).\n
				Error: ${error}`
			);
			throw error;
		}
	}

	/**
	 * Resetea el password del usuario
	 * @param {String} Email del usuario
	 * @param {String} Nuevo password
	 * @returns {Object} Usuario actualizado
	 */
	async resetPassword(email, newPassword) {
		try {
			const user = await this.dao.getByEmail(email);

			// Valida el password y si es true informa que no es posible poner el mismo password
			const samePassword = checkPassword(user, newPassword);
			if (samePassword) {
				throw new Error('You cannot use the same password.');
			}

			const newPasswordHash = createHash(newPassword);
			user.password = newPasswordHash;

			const userUpdated = await this.dao.update(user._id, user);
			return userUpdated;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to reset the user's password (repository error).\n
				Error: ${error.message}`
			);
			throw error;
		}
	}

	/**
	 * Actualiza la última conexión del usuario
	 * @param {String} ID del usuario
	 * @param {Object} Usuario editado
	 * @returns {Object} Usuario actualizado
	 */
	async updateLastConnection(userID, userUpdated) {
		try {
			if (!userID) {
				throw new Error(
					'A user ID was not provided or the ID provided does not exist.'
				);
			}

			if (!userUpdated) {
				throw new Error('A valid user was not provided.');
			}

			return await this.dao.update(userID, userUpdated);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the user's last connection. (repository error).\n
				Error: ${error.message}`
			);
			throw error;
		}
	}

	/**
	 * Chequea si un documento existe y de ser así lo reemplaza por el nuevo o bien lo agrega en caso contrario
	 * @param {Array} Documentos del usuario
	 * @returns {Array} Documentos actualizados
	 */
	async checkDocuments(documents, fileField, uploadPath) {
		const existingDocumentIndex = documents.findIndex(
			(doc) => doc.name === fileField
		);

		if (existingDocumentIndex !== -1) {
			const fileToDelete = documents[existingDocumentIndex].reference;

			documents[existingDocumentIndex] = {
				name: fileField,
				reference: uploadPath,
			};

			// Elimina archivo anterior
			fs.unlink(`${path.join(__dirname, '..', fileToDelete)}`, (err) => {
				if (err) {
					devLogger.warning(
						`Error deleting file: ${documents[existingDocumentIndex].reference}`
					);
				}
			});
		} else {
			documents.push({
				name: fileField,
				reference: uploadPath,
			});
		}
		return documents;
	}

	/**
	 * Actualiza el listado de documentos del usuario
	 * @param {String} ID del usuario
	 * @param {Object} Usuario o campo de usuario documents editado
	 * @returns {Object} Usuario actualizado
	 */
	async uploadUserDocuments(userID, documents) {
		try {
			return await this.dao.update(userID, { documents: documents });
		} catch (error) {
			devLogger.fatal(
				`User documents cannot be updated.\n
				Error: ${error.message}`
			);
			throw error;
		}
	}
}
