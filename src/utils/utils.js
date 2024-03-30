import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { devLogger } from './logger.js';

// __dirname
export default (path) => {
	const __filename = fileURLToPath(path);
	const __dirname = dirname(__filename);
	return __dirname;
};

// bcrypt - Crear hash
export const createHash = (password) => {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// bcrypt - Validar Pass
export const checkPassword = (user, password) => {
	return bcrypt.compareSync(password, user.password);
};

//jwt - Generar token
export const generateToken = (user) => {
	const token = jwt.sign({ user }, config.privateKey, { expiresIn: '1h' });
	return token;
};

//jwt - Validar token
export const verifyToken = (token) => {
	try {
		const decodedToken = jwt.verify(token, config.privateKey);
		return decodedToken;
	} catch (error) {
		devLogger.fatal('Invalid Token');
		return null;
	}
};
