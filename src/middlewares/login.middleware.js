import passport from 'passport';

// Middleware para poder mostrar mensajes de error de login al usuario en su pantalla
export default function handleLoginSession(req, res, next) {
	// Almacena la función que devuelve passport
	const middlewarePassport = passport.authenticate(
		'login',
		function verifyAuthentication(err, user, info) {
			// Si hay un error en la autenticación envía el mensaje de error
			if (err || !user) {
				return showErrorLogin(res, info);
			}

			// Si no hay error pasa al siguiente middleware
			startUserSession(req, user, next);
		}
	);

	// Ejecuta la función que devuelve passport con los parámetros requeridos
	middlewarePassport(req, res, next);
}

// Función para enviar el mensaje de error a la plantilla de handlebars
function showErrorLogin(res, info) {
	return res.render('login', {
		error: info.message || 'Error de autenticación',
	});
}

// Función para continuar con el inicio de sesión
function startUserSession(req, user, next) {
	// Inicia la sesión del usuario y pasar al siguiente middleware
	req.logIn(user, function (err) {
		if (err) {
			return next(err);
		}
		return next();
	});
}
