const resetPassToken = document.querySelector('#resetPassToken').value;
const resetPassBtn = document.querySelector('#resetPassBtn');
const resetPassError = document.querySelector('#resetPassError');
const newPassword = document.querySelector('#newPassword');
const validPassword = document.querySelector('#validPassword');

const sendResetPassForm = () => {
	if (newPassword.value !== validPassword.value) {
		resetPassError.innerHTML = '';
		resetPassError.textContent = 'Las contraseñas no coinciden.';
		return;
	}

	fetch(`/api/sessions/reset-password/${resetPassToken}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			newPassword: newPassword.value,
		}),
	})
		.then((response) => {
			if (response.status === 403) {
				resetPassError.innerHTML = '';
				resetPassError.classList.remove('d-none');
				resetPassError.textContent = 'Link vencido. Envíe un nuevo correo';
				setTimeout(() => {
					window.location.href = '/reset-password';
				}, 2500);
			}

			if (response.status === 200) {
				resetPassError.innerHTML = '';
				resetPassError.classList.remove('d-none', 'alert-danger');
				resetPassError.classList.add('alert-success');
				resetPassError.textContent = 'Contraseña Restaurada';
				setTimeout(() => {
					window.location.href = '/';
				}, 2500);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
};

resetPassBtn.addEventListener('click', sendResetPassForm);
