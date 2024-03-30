import UserDTO from '../DTO/user.dto.js';
import { UserService } from '../services/index.js';
import { generateToken, verifyToken } from '../utils/utils.js';
import selectedPersistence from '../config/persistence.js';

// Mostrar los datos principales de todos los usuarios
export const getAllUsers = async (req, res) => {
	try {
		const usersList = await UserService.getAll();

		req.logger.info('User list successfully obtained.');
		return res.status(200).send(usersList);
	} catch (error) {
		req.logger.fatal('Could not get user list.');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

export const getUserId = async (req, res) => {
	try {
		const { eml } = req.params;

		const user = await UserService.getUserByEmail(eml);
		const userId = user._id;

		req.logger.info('User Id successfully obtained.');
		return res.status(200).json(userId);
	} catch (error) {
		req.logger.fatal('Could not get user id.');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Eliminar usuarios inactivos
export const deleteInactiveUsers = async (req, res) => {
	try {
		const deletionResult = await UserService.deleteInactiveUsers();

		req.logger.info('Inactive users removed.');
		return res.status(204).send(deletionResult);
	} catch (error) {
		req.logger.fatal('It is not possible to delete the inactive users.');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Estrategia local (logueo de usuario)
export const loginUser = async (req, res) => {
	try {
		if (!req.user) return res.status(401).send('Invalid Credentials');

		const isMongoPersistence =
			selectedPersistence.persistence === 'MONGO' ? true : false;

		// Para garantizar compatibilidad con la persistencia FILE en el login
		if (isMongoPersistence) {
			await UserService.updateLastConnection(req.user._id, {
				last_connection: new Date(),
			});
		}

		req.session.user = req.user;
		return res
			.cookie('token', req.user.token, {
				httpOnly: true,
				maxAge: 86400000,
			})
			.redirect('/products');
	} catch (error) {
		req.logger.fatal('User could not log in');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Estrategia GitHub (logueo de usuario)
export const loginGithub = (req, res) => {
	try {
	} catch (error) {
		req.logger.fatal('The user could not log in using their GitHub account');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

export const loginGithubCallBack = async (req, res) => {
	try {
		await UserService.updateLastConnection(req.user._id, {
			last_connection: new Date(),
		});

		req.session.user = req.user;
		return res
			.cookie('token', req.user.token, {
				httpOnly: true,
				maxAge: 86400000,
			})
			.redirect('/products');
	} catch (error) {
		req.logger.fatal(
			'The user could not log in using their GitHub account (callback endpoint)'
		);
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Estrategia local (registro de usuario)
export const registerUser = async (req, res) => {
	try {
		return res.status(201).redirect('/');
	} catch (error) {
		req.logger.fatal('Failed to register user');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Para informar errores en el registro de un usuario
export const failRegister = (req, res) => {
	try {
		return res.status(400).json({ error: 'Registration Failed' });
	} catch (error) {
		req.logger.fatal('Failed to display failRegister endpoint');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Muestra los datos del usuario logueado
export const currentUser = async (req, res) => {
	try {
		const userData = req.session.user;
		const user = new UserDTO(userData);
		return res.send(user);
	} catch (error) {
		req.logger.fatal('Could not display data for current user');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Desloguea a un usuario
export const logoutUser = async (req, res) => {
	try {
		if (!req.session.user) {
			return res.redirect('/');
		}

		const isAdmin = req.session.user.role === 'ADMIN' ? true : false;
		if (!isAdmin) {
			await UserService.updateLastConnection(req.session.user._id, {
				last_connection: new Date(),
			});
		}

		req.session.destroy((err) => {
			if (err) return res.send('Logout Error');

			return res.clearCookie('token').redirect('/');
		});
	} catch (error) {
		req.logger.fatal('User could not be logged out');
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Subir archivos del usuario
export const uploadUserFiles = async (req, res) => {
	try {
		const { uid } = req.params;
		const user = await UserService.getUserById(uid);
		if (!user) return res.status(404).send('User is not found');

		if (!req.files) {
			return res.status(400).send('No files were uploaded.');
		}

		let documents = user.documents || [];

		for (const fileField of Object.keys(req.files)) {
			const file = req.files[fileField][0];
			let uploadPath = '';
			switch (file.fieldname) {
				case 'profileImage':
					uploadPath = `/public/img/profiles/${file.filename}`;
					break;
				case 'productImage':
					uploadPath = `/public/img/usersProducts/${file.filename}`;
					break;
				case 'personal-identification':
					uploadPath = `/public/userDocuments/${file.filename}`;
					break;
				case 'proof-of-address':
					uploadPath = `/public/userDocuments/${file.filename}`;
					break;
				case 'proof-of-account-status':
					uploadPath = `/public/userDocuments/${file.filename}`;
					break;
				case 'userDocument':
					uploadPath = `/public/userDocuments/${file.filename}`;
					break;
				default:
					break;
			}

			documents = await UserService.checkDocuments(
				documents,
				fileField,
				uploadPath
			);
		}

		await UserService.uploadUserDocuments(uid, documents);

		return res.status(200).send(`The file was uploaded successfully.`);
	} catch (error) {
		req.logger.fatal(`It is not possible to upload the file.`);
		res.status(500).send(`Internal Server Error: ${error.message}`);
	}
};

// Cambia el rol de un usuario
export const toggleUserRole = async (req, res) => {
	try {
		const { uid } = req.params;
		const user = await UserService.getUserById(uid);
		if (!user) return res.status(404).send('User is not found');

		if (user.role === 'USER') {
			const documentsUploaded = await UserService.areDocumentsUploaded(user);

			if (!documentsUploaded) {
				req.logger.warning(`User has not uploaded all required documents`);
				return res
					.status(400)
					.send('User has not uploaded all required documents');
			} else {
				await UserService.toggleUserRole(user);
				return res
					.status(200)
					.send(`The user's role was successfully modified`);
			}
		}

		await UserService.toggleUserRole(user);

		return res.status(200).send(`The user's role was successfully modified`);
	} catch (error) {
		req.logger.fatal(`It is not possible to change the user's role`);
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Envía mail para reseteo de password
export const sendResetPassEmail = async (req, res) => {
	try {
		const userEmail = req.body.userEmail;
		const userExist = await UserService.getUserByEmail(userEmail);

		if (userExist === null) {
			req.logger.warning(
				'The email does not correspond to any registered user.'
			);
			return res
				.status(404)
				.send('The email does not correspond to any registered user.');
		} else {
			const resetToken = generateToken(userEmail);

			await UserService.sendResetPassEmail(userEmail, resetToken);

			return res
				.status(200)
				.send(
					'An email has been sent to your address with the link to reset your password'
				);
		}
	} catch (error) {
		req.logger.fatal(
			`It is not possible to send the email to reset the password (controller error).`
		);
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};

// Resetea password del usuario
export const resetPassword = async (req, res) => {
	try {
		const { tkn } = req.params;
		const { newPassword } = req.body;
		const decodedToken = verifyToken(tkn);

		if (!decodedToken) {
			req.logger.warning(
				'Invalid token. Generate a new link (controller error)'
			);
			return res.status(403).send('Invalid token');
		}

		const userEmail = decodedToken.user;
		await UserService.resetPassword(userEmail, newPassword);

		req.logger.info('Password successfully restored');
		return res.status(200).send('Success');
	} catch (error) {
		req.logger.fatal(
			`It is not possible to reset the password (controller error)`
		);
		res.status(500).send(`Internal Server Error: ${error}`);
	}
};
