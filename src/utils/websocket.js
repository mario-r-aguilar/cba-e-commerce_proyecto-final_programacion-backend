import { Server } from 'socket.io';
import { ProductService, ChatService } from '../services/index.js';
import selectedPersistence from '../config/persistence.js';
import { devLogger } from './logger.js';

export function socketServer(server) {
	const io = new Server(server);

	io.on('connection', async (socket) => {
		// Mensaje de conexión de un cliente
		devLogger.info('Cliente conectado');

		// Modifico el valor por defecto del límite
		let limitValue = 50;
		let productList = await ProductService.getProducts(limitValue);

		// Envía la lista de productos cuando un cliente se conecta (el mensaje depende de la persistencia seleccionada)
		if (selectedPersistence.persistence === 'MONGO') {
			socket.emit('productList', productList);
		} else {
			socket.emit('productListFile', productList);
		}

		socket.on('updatedList', async (data) => {
			let limitValue = 50;
			let productList = await ProductService.getProducts(limitValue);
			// Envía la lista de productos cada vez que es modificada
			if (selectedPersistence.persistence === 'MONGO') {
				socket.emit('productList', productList);
			} else {
				socket.emit('productListFile', productList);
			}
		});

		socket.on('productsLimit', async (data) => {
			let productList = await ProductService.getProducts(data);
			// Envía la lista de productos si se establece un límite
			if (selectedPersistence.persistence === 'MONGO') {
				socket.emit('productList', productList);
			} else {
				socket.emit('productListFile', productList);
			}
		});

		// Manejo del chat
		socket.emit('messages', await ChatService.getMessages());

		socket.on('message', async (data) => {
			await ChatService.createMessage(data);
			io.emit('messages', await ChatService.getMessages());
		});

		socket.on('getMessages', async () => {
			socket.emit('messages', await ChatService.getMessages());
		});

		socket.on('newUserConnect', (newUser) => {
			socket.broadcast.emit('userConnected', newUser);
		});

		// Mensaje de desconexión de un cliente
		socket.on('disconnect', () => {
			devLogger.info('Cliente desconectado');
		});
	});

	return io;
}
