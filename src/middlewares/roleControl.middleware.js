import UserDTO from '../DTO/user.dto.js';

// Manejo de permisos según el rol del usuario
export const roleControl = (...authRoles) => {
	return (req, res, next) => {
		const userData = req.session.user;
		const user = new UserDTO(userData);
		// Verifica si el usuario tiene un rol permitido
		if (user && authRoles.includes(user.role)) {
			return next(); // De ser así permite el acceso a la ruta
		} else {
			return res.status(403).send({
				status: 'error',
				message: 'Unauthorized access to the resource',
			});
		}
	};
};
