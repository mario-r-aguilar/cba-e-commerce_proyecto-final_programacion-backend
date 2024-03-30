const getIdBtn = document.querySelector('#getIdBtn');
const toggleRoleBtn = document.querySelector('#toggleRoleBtn');
const deleteInactiveUsersBtn = document.querySelector(
	'#deleteInactiveUsersBtn'
);
const getUsersListBtn = document.querySelector('#getUsersListBtn');

const getIdFn = () => {
	const userEmail = document.querySelector('#userEmail').value;
	const getIdMessage = document.querySelector('#getIdMessage');

	// loader
	const waitingGetIdProcess = document.querySelector('#waitingGetIdProcess');
	waitingGetIdProcess.classList.remove('d-none');

	fetch(`/api/sessions/getid/${userEmail}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => {
			waitingGetIdProcess.classList.add('d-none');
			return res.json();
		})
		.then((userId) => {
			if (!userId) {
				getIdMessage.innerHTML = '';
				getIdMessage.classList.remove('d-none');
				getIdMessage.classList.add('alert-danger');
				getIdMessage.textContent =
					'Error al intentar obtener la Id del usuario.';
				setTimeout(() => {
					getIdMessage.innerHTML = '';
					getIdMessage.classList.remove('alert-danger');
					getIdMessage.classList.add('d-none');
				}, 2500);
			} else {
				getIdMessage.innerHTML = '';
				getIdMessage.classList.remove('d-none');
				getIdMessage.classList.add('alert-success');
				getIdMessage.textContent = `La Id del usuario es: ${userId}`;
				setTimeout(() => {
					getIdMessage.innerHTML = '';
					getIdMessage.classList.remove('alert-success');
					getIdMessage.classList.add('d-none');
				}, 5000);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
};

getIdBtn.addEventListener('click', getIdFn);

const toggleUserRoleFn = () => {
	const userId = document.querySelector('#userId').value;
	const toggleRoleMessage = document.querySelector('#toggleRoleMessage');

	// loader
	const waitingToggleRoleProcess = document.querySelector(
		'#waitingToggleRoleProcess'
	);
	waitingToggleRoleProcess.classList.remove('d-none');

	fetch(`/api/sessions/premium/${userId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((response) => {
			if (!response.ok) {
				waitingToggleRoleProcess.classList.add('d-none');
				toggleRoleMessage.innerHTML = '';
				toggleRoleMessage.classList.remove('d-none');
				toggleRoleMessage.classList.add('alert-danger');
				toggleRoleMessage.textContent = 'Error al intentar cambiar el rol.';
				setTimeout(() => {
					toggleRoleMessage.innerHTML = '';
					toggleRoleMessage.classList.remove('alert-danger');
					toggleRoleMessage.classList.add('d-none');
				}, 2500);
			} else {
				waitingToggleRoleProcess.classList.add('d-none');
				toggleRoleMessage.innerHTML = '';
				toggleRoleMessage.classList.remove('d-none');
				toggleRoleMessage.classList.add('alert-success');
				toggleRoleMessage.textContent =
					'El rol del usuario se ha cambiado.';
				setTimeout(() => {
					toggleRoleMessage.innerHTML = '';
					toggleRoleMessage.classList.remove('alert-success');
					toggleRoleMessage.classList.add('d-none');
				}, 3000);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
};

toggleRoleBtn.addEventListener('click', toggleUserRoleFn);

const deleteInactiveUsersFn = () => {
	const deleteInactiveUsersMessage = document.querySelector(
		'#deleteInactiveUsersMessage'
	);

	// loader
	const waitingDeleteProcess = document.querySelector('#waitingDeleteProcess');
	waitingDeleteProcess.classList.remove('d-none');

	fetch(`/api/sessions/`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => {
		if (!res.ok) {
			waitingDeleteProcess.classList.add('d-none');
			deleteInactiveUsersMessage.innerHTML = '';
			deleteInactiveUsersMessage.classList.remove('d-none');
			deleteInactiveUsersMessage.classList.add('alert-danger');
			deleteInactiveUsersMessage.textContent =
				'Error al intentar eliminar los usuarios inactivos.';
			setTimeout(() => {
				deleteInactiveUsersMessage.innerHTML = '';
				deleteInactiveUsersMessage.classList.remove('alert-danger');
				deleteInactiveUsersMessage.classList.add('d-none');
			}, 2500);
		} else {
			waitingDeleteProcess.classList.add('d-none');
			deleteInactiveUsersMessage.innerHTML = '';
			deleteInactiveUsersMessage.classList.remove('d-none');
			deleteInactiveUsersMessage.classList.add('alert-success');
			deleteInactiveUsersMessage.textContent =
				'Se han eliminado los usuarios inactivos satisfactoriamente.';
			setTimeout(() => {
				deleteInactiveUsersMessage.innerHTML = '';
				deleteInactiveUsersMessage.classList.remove('alert-success');
				deleteInactiveUsersMessage.classList.add('d-none');
			}, 3000);
		}
	});
};

deleteInactiveUsersBtn.addEventListener('click', deleteInactiveUsersFn);

const getUsersListFn = () => {
	// loader
	const waitingGetUsersProcess = document.querySelector(
		'#waitingGetUsersProcess'
	);
	waitingGetUsersProcess.classList.remove('d-none');

	const getUsersListTitle = document.querySelector('#getUsersListTitle');
	getUsersListTitle.innerHTML = '';
	const insertTitle = document.createElement('h3');
	insertTitle.innerHTML = 'Listado de Usuarios';
	insertTitle.classList.add('ms-3');
	getUsersListTitle.appendChild(insertTitle);

	const getUsersListMessage = document.querySelector('#getUsersListMessage');
	getUsersListMessage.innerHTML = '';

	fetch(`/api/sessions/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => {
			waitingGetUsersProcess.classList.add('d-none');
			return res.json();
		})
		.then((users) => {
			users.forEach((user) => {
				const elementHtml = document.createElement('div');
				elementHtml.innerHTML = `			
					
					<div
					class='card p-3 mt-3 mb-3 ms-3 shadow-lg'
					id='cardProduct' 
					style='width: 18rem; height: 16rem'
					>	

						<div class='card-body'>
							<h5 class='card-title mb-3 ps-1 pb-1 text-light bg-dark'>
								<b class='card-title'>${user.name} ${user.lastname}</b>
							</h5>
							<span class='card-text'>Correo: </span>
							<p class='card-text'>
								<b>${user.email}</b>
							</p>
							<span class='card-text'>Rol: </span>
							<p class='card-text'>
								<b>${user.role}</b>
							</p>
						</div>
						
					</div>
				`;
				getUsersListMessage.appendChild(elementHtml);
			});
		});
};

getUsersListBtn.addEventListener('click', getUsersListFn);
