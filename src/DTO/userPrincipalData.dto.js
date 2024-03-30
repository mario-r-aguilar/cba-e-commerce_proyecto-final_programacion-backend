export default class UserPrincipalDataDTO {
	constructor(user) {
		this.name = user?.name ?? 'You are not logged in.';
		this.lastname = user?.lastname ?? 'Logged in please';
		this.email = user?.email ?? '';
		this.role = user?.role ?? '';
	}
}
