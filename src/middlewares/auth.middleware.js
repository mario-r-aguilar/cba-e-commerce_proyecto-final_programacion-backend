// Verifica si el usuario está logueado
export function isUserAuth(req, res, next) {
	// Si el usuario tiene la sesión abierta lo redirecciona a la página de productos
	if (req.session?.user) return res.redirect('/products');

	return next();
}
