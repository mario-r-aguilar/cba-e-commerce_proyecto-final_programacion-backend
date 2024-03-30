import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import passportJWT from 'passport-jwt';
import { UserService, CartService } from '../services/index.js';
import { createHash, checkPassword, generateToken } from '../utils/utils.js';
import config from './config.js';
import selectedPersistence from './persistence.js';
import { devLogger } from '../utils/logger.js';
import mongoose from 'mongoose';

// Core de las estrategias
const LocalStrategy = local.Strategy;
const JWTStrategy = passportJWT.Strategy;

// Función para extraer las cookies en la estrategia JWT
const cookieExtractor = (req) => {
	const token = req?.cookies ? req.cookies['token'] : null;
	return token;
};

const initializePassport = () => {
	// Estrategia JWT
	passport.use(
		'current',
		new JWTStrategy(
			{
				secretOrKey: config.privateKey,
				jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([
					cookieExtractor,
				]),
			},
			(current_payload, done) => {
				return done(null, current_payload);
			}
		)
	);

	// Estrategia local
	passport.use(
		'register',
		new LocalStrategy(
			{
				passReqToCallback: true, // Permite el acceso al objeto req
				usernameField: 'email', // Define al campo email como username
			},
			async (req, username, password, done) => {
				try {
					// Verifica si el usuario ya existe
					const validUser = await UserService.getUserByEmail(username);
					if (validUser) {
						devLogger.info('User already exists');
						return done(null, false);
					}

					// Evita la creación de un usuario con el mismo email del administrador
					if (username === config.adminMail) {
						devLogger.error('Invalid email. Use another email address');
						return done(null, false);
					}

					// Almacena los datos del nuevo usuario y hashea su password
					const newUser = req.body;
					newUser.password = createHash(password);

					// Crea un carrito nuevo y lo asigna al usuario creado (solo en persistencia MONGO)
					if (selectedPersistence.persistence === 'MONGO') {
						newUser.cart = await CartService.addCart({
							products: [],
						});
					}

					// Almacena el nuevo usuario y lo devuelve
					const result = await UserService.addUser(newUser);
					return done(null, result);
				} catch (error) {
					done(`Error interno del servidor: ${error}`);
				}
			}
		)
	);

	passport.use(
		'login',
		new LocalStrategy(
			{ usernameField: 'email' }, // Define el campo email como username
			async (username, password, done) => {
				try {
					// Verifica si se trata del usuario administrador y lo autentica
					if (
						username == config.adminMail &&
						password == config.adminPass
					) {
						const adminID = config.adminId;
						const validId = new mongoose.Types.ObjectId(adminID);

						const user = {
							_id: validId,
							name: config.adminName,
							lastname: config.adminLastname,
							email: config.adminMail,
							age: config.adminAge,
							cart: config.adminCart,
							password: createHash(config.adminPass),
							role: config.adminRole,
							documents: [],
							last_connection: new Date(),
						};

						const token = generateToken(user);
						user.token = token;

						return done(null, user);
					}

					// Verifica si el usuario existe y si su password es correcto
					const user = await UserService.getUserByEmail(username);
					if (!user) {
						// Envía un mensaje con el error
						return done(null, false, { message: 'Usuario incorrecto' });
					}

					if (!checkPassword(user, password)) {
						// Envía un mensaje con el error
						return done(null, false, { message: 'Password incorrecto' });
					}

					const token = generateToken(user);
					user.token = token;

					// Autentica el usuario
					return done(null, user);
				} catch (error) {
					return done(null, false, {
						message: `Error interno del servidor: ${error}`,
					});
				}
			}
		)
	);

	// Estrategia GitHub
	passport.use(
		'github',
		new GitHubStrategy(
			// Datos de la app de GitHub
			{
				clientID: config.gitHubClientId,
				clientSecret: config.gitHubClientSecret,
				callbackURL: config.gitHubCallbackUrl,
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					// Verifica si el usuario ya existe
					const user = await UserService.getUserByEmail(
						profile._json.email
					);

					if (user) {
						const token = generateToken(user);
						user.token = token;

						return done(null, user);
					}

					// Si no existe genera uno con los datos que obtiene desde GitHub
					const newUser = await UserService.addUser({
						name: profile._json.name,
						lastname: '',
						email: profile._json.email,
						age: 18,
						password: '',
						cart: await CartService.addCart({
							products: [],
						}),
						role: 'USER',
						documents: [],
						last_connection: new Date(),
					});

					const token = generateToken(newUser);
					newUser.token = token;

					// Autentica el usuario
					return done(null, newUser);
				} catch (error) {
					devLogger.error(error);
				}
			}
		)
	);

	// Serializa el usuario
	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	// Deserializa el usuario
	passport.deserializeUser(async (id, done) => {
		// Este bloque se usa para poder usar el usuario administrador
		if (id === config.adminId) {
			return done(null, false);
		}

		const user = await UserService.getUserById(id);
		done(null, user);
	});
};

export default initializePassport;
