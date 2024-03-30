import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { devLogger } from '../../utils/logger.js';
import CartFileDAO from './CartFile.dao.js';

// Creo instancia para poder agregar un carrito al usuario al crearlo
// Evito así que se asigne el mismo carrito a dos o más usuarios
const cartFileDAO = new CartFileDAO();

export default class UserFileDAO {
	constructor() {
		this.path = './src/DAO/file/db/users.json';

		// Si el usuario no brinda una ruta, crea el archivo
		if (!fs.existsSync(this.path)) {
			fs.writeFileSync(this.path, JSON.stringify([]));
		}
	}

	/**
	 * Busca el listado de usuarios
	 * @returns {Array} Listado de usuarios
	 */
	async get() {
		try {
			const usersList = await fs.promises.readFile(this.path, 'utf-8');
			return JSON.parse(usersList);
		} catch (error) {
			devLogger.fatal(
				`It is not possible to obtain the users.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Busca un usuario mediante su ID
	 * @param {String} ID del usuario
	 * @returns {Object} Usuario
	 */
	async getById(userID) {
		try {
			const usersList = await this.get();
			const userSearch = usersList.find((user) => user._id === userID);

			if (userSearch) {
				return userSearch;
			} else {
				devLogger.error(`User ID ${userID} not found`);
				return null;
			}
		} catch (error) {
			devLogger.fatal(
				`Unable to get the user.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Busca un usuario mediante su email
	 * @param {String} Email del usuario
	 * @returns {Object} Usuario
	 */
	async getByEmail(userEmail) {
		try {
			const usersList = await this.get();
			const userSearch = usersList.find((user) => user.email === userEmail);

			if (userSearch) {
				return userSearch;
			} else {
				devLogger.error(`User ${userEmail} not found`);
				return null;
			}
		} catch (error) {
			devLogger.fatal(
				`Unable to get the user.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Agrega un nuevo usuario
	 * @param {Object} Usuario
	 * @returns {Object} Usuario creado
	 */
	async add(newUser) {
		try {
			let { name, lastname, email, age, password } = newUser;
			age = parseInt(age); // para garantizar el tipo de valor

			if (
				typeof name !== 'string' ||
				typeof lastname !== 'string' ||
				typeof email !== 'string' ||
				typeof age !== 'number' ||
				typeof password !== 'string'
			) {
				return devLogger.error(
					'One or more fields have invalid data types'
				);
			}

			const usersList = await this.get();

			// para garantizar que el email sea único en la base de datos
			if (usersList.some((emails) => emails.email === email))
				return devLogger.error(
					`The email ${email} already exists. Try another email`
				);

			// valores predeteminados
			let _id = uuidv4();
			let role = 'USER';
			let cart = await cartFileDAO.add({
				products: [],
			});
			let documents = [];
			let last_connection = Date.now();

			let newUserWithID = {
				_id,
				name,
				lastname,
				email,
				age,
				cart,
				password,
				role,
				documents,
				last_connection,
			};

			usersList.push(newUserWithID);

			await fs.promises.writeFile(this.path, JSON.stringify(usersList));

			devLogger.info(`The user was successfully added`);
			return newUserWithID;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to create the user.\n 
				Error: ${error}`
			);
		}
	}

	/**
	 * Elimina un usuario
	 * @param {String} ID del usuario
	 * @returns {@type void}
	 */
	async delete(userID) {
		try {
			const usersList = await this.get();

			const userToDelete = usersList.find((user) => user._id === userID);
			if (!userToDelete) {
				devLogger.error(`User ID ${userID} not found`);
				return null;
			}

			const newUserList = usersList.filter((user) => user._id != userID);

			await fs.promises.writeFile(this.path, JSON.stringify(newUserList));

			devLogger.info(`The user ID ${userID} was removed`);
			return;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to delete the user.\n 
				Error: ${error}`
			);
			return;
		}
	}

	/**
	 * Actualiza un usuario
	 * @param {String} ID del usuario
	 * @param {Object} Usuario editado
	 * @returns {Object} Usuario actualizado
	 */
	async update(userID, userUpdated) {
		try {
			const usersList = await this.get();
			const userIndex = usersList.findIndex((user) => user._id === userID);

			if (userIndex === -1) {
				devLogger.error(`User ID ${userID} not found`);
				return null;
			}

			const updatedUser = {
				...usersList[userIndex],
				...userUpdated,
			};

			usersList[userIndex] = updatedUser;

			await fs.promises.writeFile(this.path, JSON.stringify(usersList));

			devLogger.info(`The user ID ${userID} was updated`);
			return updatedUser;
		} catch (error) {
			devLogger.fatal(
				`It is not possible to update the user.\n 
				Error: ${error}`
			);
			return null;
		}
	}
}
