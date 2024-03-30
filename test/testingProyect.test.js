import supertest from 'supertest';
import * as chai from 'chai';
import { fakerES_MX as faker } from '@faker-js/faker';
import config from '../src/config/config.js';

const expect = chai.expect;
const requester = supertest(`${config.serverUrl}`);

// Antes de hacer el test, se debe cambiar el valor de la variable de entorno MODE_TEST a 'Yes'
// Luego ejecutar el servidor en una terminal y en otra terminal ejecutar el comando npm test

describe('Integral Test E-commerce', function () {
	let cookies;
	let adminCookies;
	let productId;
	let cartId;

	const testerUser = {
		name: faker.person.firstName(),
		lastname: faker.person.lastName(),
		email: faker.internet.email(),
		age: faker.number.int({ min: 18, max: 100 }),
		password: faker.internet.password(),
	};

	describe('Testing sessions, products y carts routers', function () {
		it('Se debe poder loguear el administrador y devolver una cookie', async function () {
			const result = await requester.post('/api/sessions/login').send({
				email: config.adminMail,
				password: config.adminPass,
			});

			expect(result.text).to.be.equal('Found. Redirecting to /products');

			const adminCookieResult1 = result.headers['set-cookie'][0];
			const adminCookieResult2 = result.headers['set-cookie'][1];

			let adminCookie1 = {
				name: adminCookieResult1.split('=')[0],
				value: adminCookieResult1.split('=')[1].split(';')[0],
			};
			let adminCookie2 = {
				name: adminCookieResult2.split('=')[0],
				value: adminCookieResult2.split('=')[1].split(';')[0],
			};

			adminCookies = [
				`${adminCookie1.name}=${adminCookie1.value}`,
				`${adminCookie2.name}=${adminCookie2.value}`,
			];

			expect(adminCookie1.name).to.be.ok.and.eql('token');
			expect(adminCookie2.name).to.be.ok.and.eql('connect.sid');
		});

		it('El administrador debe poder crear un producto', async function () {
			const testProduct = {
				title: faker.commerce.product(),
				description: faker.commerce.productDescription(),
				code: faker.string.alphanumeric(10),
				price: faker.commerce.price(),
				status: faker.datatype.boolean(),
				stock: faker.number.int({ max: 100 }),
				category: faker.commerce.department(),
				thumbnail: faker.image.url(),
			};

			const result = await requester
				.post('/api/products')
				.set('Cookie', adminCookies)
				.send(testProduct);

			productId = result.body._id;

			expect(result._body).to.have.property('_id');
			expect(result._body.code).to.be.eql(testProduct.code);
		});

		it('El administrador debe poder actualizar un producto', async function () {
			const testProductUpdated = {
				title: faker.commerce.product(),
				description: faker.commerce.productDescription(),
				code: faker.string.alphanumeric(10),
				price: faker.commerce.price(),
				status: faker.datatype.boolean(),
				stock: faker.number.int({ max: 100 }),
				category: faker.commerce.department(),
				thumbnail: faker.image.url(),
			};

			const result = await requester
				.put(`/api/products/${productId}`)
				.set('Cookie', adminCookies)
				.send(testProductUpdated);

			expect(result._body.acknowledged).to.be.true;
			expect(result._body.modifiedCount).to.be.equal(1);
		});

		it('Se debe poder obtener el listado de productos', async function () {
			const result = await requester
				.get('/api/products')
				.set('Cookie', adminCookies)
				.send();

			expect(result._body.payload).to.be.ok;
			expect(result._body.status).to.be.ok;
			expect(Array.isArray(result._body.payload.docs)).to.be.true;
		});

		it('Se debe poder registrar un usuario', async function () {
			const result = await requester
				.post('/api/sessions/register')
				.send(testerUser);

			expect(result.text).to.be.equal('Found. Redirecting to /');
		});

		it('Se debe poder loguear un usuario y devolver una cookie', async function () {
			const result = await requester.post('/api/sessions/login').send({
				email: testerUser.email,
				password: testerUser.password,
			});

			expect(result.text).to.be.equal('Found. Redirecting to /products');

			const cookieResult1 = result.headers['set-cookie'][0];
			const cookieResult2 = result.headers['set-cookie'][1];

			let cookie1 = {
				name: cookieResult1.split('=')[0],
				value: cookieResult1.split('=')[1].split(';')[0],
			};
			let cookie2 = {
				name: cookieResult2.split('=')[0],
				value: cookieResult2.split('=')[1].split(';')[0],
			};

			cookies = [
				`${cookie1.name}=${cookie1.value}`,
				`${cookie2.name}=${cookie2.value}`,
			];

			expect(cookie1.name).to.be.ok.and.eql('token');
			expect(cookie2.name).to.be.ok.and.eql('connect.sid');
		});

		it('Se debe poder consumir endpoint /api/sessions/current con cookie', async function () {
			const result = await requester
				.get('/api/sessions/current')
				.set('Cookie', cookies);

			cartId = result._body.cart[0];

			expect(result._body.email).to.be.eql(testerUser.email);
		});

		it('El usuario debe poder agregar un producto a su carrito', async function () {
			const result = await requester
				.post(`/api/carts/${cartId}/products/${productId}`)
				.set('Cookie', cookies)
				.send();

			expect(result).to.be.ok;

			const cart = await requester
				.get(`/api/carts/${cartId}`)
				.set('Cookie', cookies)
				.send();

			expect(cart._body.products[0].product._id).to.be.equal(productId);
		});

		it('El usuario debe poder cambiar la cantidad de un producto que se encuentra en el carrito', async function () {
			let newQuantity = 15;

			const result = await requester
				.put(`/api/carts/${cartId}/products/${productId}`)
				.set('Cookie', cookies)
				.send({ quantity: newQuantity });

			expect(result).to.be.ok;

			const cart = await requester
				.get(`/api/carts/${cartId}`)
				.set('Cookie', cookies)
				.send();

			expect(cart._body.products[0].quantity).to.be.equal(newQuantity);
		});

		it('El usuario debe poder vaciar su carrito', async function () {
			const result = await requester
				.delete(`/api/carts/${cartId}`)
				.set('Cookie', cookies)
				.send();

			expect(result).to.be.ok;

			const cart = await requester
				.get(`/api/carts/${cartId}`)
				.set('Cookie', cookies)
				.send();

			expect(cart._body.products.length).to.be.equal(0);
		});

		it('El administrador debe poder eliminar un producto', async function () {
			const result = await requester
				.delete(`/api/products/${productId}`)
				.set('Cookie', adminCookies)
				.send();

			expect(result).to.be.ok;

			const product = await requester
				.get(`/api/products/${productId}`)
				.set('Cookie', adminCookies)
				.send();

			expect(product.status).to.be.equal(404);
		});
	});
});
