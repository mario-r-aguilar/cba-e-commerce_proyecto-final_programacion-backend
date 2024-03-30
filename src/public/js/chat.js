let socket;
const user = document.querySelector('#userEmail').value;
if (user) {
	document.querySelector('#username').innerHTML = user + ': ';
	initIO();
} else {
	Swal.fire({
		icon: 'info',
		title: 'Bienvenido',
		input: 'text',
		text: 'Escribe tu email',
		inputValidator: (value) => {
			return !value.trim() && 'Por favor. Escribe tu email';
		},
		allowOutsideClick: false,
	}).then((result) => {
		user = result.value;
		document.querySelector('#username').innerHTML = user + ': ';
		initIO();
		socket.emit('newUserConnect', user);
		socket.emit('getMessages');
		socket.on('userConnected', (newUser) => {
			Swal.fire({
				text: `Se conecto ${newUser}`,
				toast: true,
				position: 'top-right',
			});
		});
	});
}

// Almacena lo que el usuario escribe
const input = document.querySelector('#chatInput');
input.addEventListener('keyup', (event) => {
	if (event.key === 'Enter') sendMessage(event.currentTarget.value);
});

// Funcionalidad del botón enviar mensaje
const btnSend = document.querySelector('#send');
btnSend.addEventListener('click', (event) => sendMessage(input.value));

// Envía el mensaje usando socket.io
function sendMessage(message) {
	// no envía mensajes vacíos
	if (message.trim().length > 0) {
		socket.emit('message', { user, message });
		input.value = '';
	}
}

// Inicia socket y renderiza los mensajes del chat
function initIO() {
	socket = io();

	socket.on('messages', (messages) => {
		const chatBox = document.querySelector('#chatBox');
		let html = '';

		// renderiza los mensajes comenzando desde el último al primero
		messages.reverse().forEach((message) => {
			html += `<p><i class="fw-bold p-1">${message.user}</i>: ${message.message}</p>`;
		});

		chatBox.innerHTML = html;
	});

	socket.emit('getMessages');
}
