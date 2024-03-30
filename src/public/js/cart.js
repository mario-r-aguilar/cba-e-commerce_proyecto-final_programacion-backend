// Información necesaria obtenida desde el archivo handlebars
const cartID = document.querySelector('#getCartId').value;
const userRole = document.querySelector('#getUserRole').value;
const cartPage = document.body;

// Vista del carrito para administradores
const adminView = () => {
	if (userRole === 'ADMIN') {
		const totalCash = document.querySelector('#totalPurchase');
		totalCash.innerHTML = '';
		totalCash.classList.remove('alert', 'alert-info', 'w-50');
		const btnSection = document.querySelector('.buttonsSecction');
		btnSection.innerHTML = '';
		btnSection.innerHTML = `
		<button
		class='btn btn-dark btnBack border border-dark shadow ms-5 mb-3'
		id='btnBackToHome'
		>
			Volver al Inicio
		</button>
		`;
		const productSection = document.querySelector('.text-bg-danger');
		productSection.innerHTML = '';
		productSection.innerHTML = `
		Los administradores no pueden agregar productos al carrito
		`;
	} else {
		renderTotalPurchase();
	}
};

// Actualiza la página
const refreshCartPage = (cartID) => {
	const url = `/carts/${cartID}`;
	document.location.href = url;
};

// Calcula el precio total de los productos que se encuentran en el carrito
const calculateTotalPurchase = async () => {
	// obtiene el contenido del carrito
	return fetch(`/api/carts/${cartID}`)
		.then((response) => response.json())
		.then((cart) => {
			// realiza el cálculo
			let totalPrice = cart.products.reduce(
				(total, product) =>
					total + product.product.price * product.quantity,
				0
			);
			return totalPrice;
		})
		.catch((error) => {
			console.error(error);
		});
};

// Muestra el el precio total de los productos que se encuentran en el carrito
const renderTotalPurchase = () => {
	const totalPurchase = document.getElementById('totalPurchase');
	totalPurchase.innerHTML = '';

	// maneja el resultado de la función con then porque devuelve una promesa
	calculateTotalPurchase().then((total) => {
		const div = document.createElement('div');
		div.innerHTML = `<h3>Total del carrito: $${total}</h3>`;
		totalPurchase.appendChild(div);
	});
};

// Funcionalidad del botón volver al inicio
cartPage.addEventListener('click', (event) => {
	if (event.target.classList.contains('btnBack')) {
		const url = '/';
		document.location.href = url;
	}
});

// Funcionalidad de botones para cambiar la cantidad y para quitar el producto del carrito
const btnProductInCart = document.querySelectorAll('.btnProductInCart');
if (btnProductInCart) {
	btnProductInCart.forEach((button) => {
		button.addEventListener('click', async (event) => {
			// Obtiene el ID del producto
			const productID = event.target.getAttribute('data-product-id');
			// Asigna un valor según la clase que tenga el botón presionado
			const action = event.target.classList.contains('btnChangeProductQty')
				? 'change'
				: 'remove';

			// Obtiene la cantidad actualizada
			let productQty = document.querySelector(
				`#productQty_${productID}`
			).value;

			// Asigna el valor 1 en caso de ingresos de números negativos, cero o ningún valor
			if (productQty <= 0 || productQty === null) {
				productQty = 1;
			}

			// Realiza la petición según la accion seleccionada
			await fetch(`/api/carts/${cartID}/products/${productID}`, {
				method: action === 'change' ? 'put' : 'delete',
				body:
					action === 'change'
						? JSON.stringify({ quantity: productQty })
						: '',
				headers: {
					'Content-Type': 'application/json',
				},
			}).catch((error) => {
				console.error(error);
			});

			// Actualiza la página con cada cambio
			refreshCartPage(cartID);
		});
	});
}

// Efectuar la compra con Mercado Pago
// Botón de compra
const btnFinishBuy = document.querySelector('#btnFinishBuy');
// Loader
const waitingPurchasingProcess = document.querySelector(
	'#waitingPurchasingProcess'
);
// Id de compra
let orderId;
// Integración de Mercado Pago
let mp;

if (btnFinishBuy) {
	btnFinishBuy.onclick = () => {
		// Obtener clave pública
		const getMpPublicKey = () => {
			fetch(`/api/mp/publicKey`)
				.then((response) => response.json())
				.then((publicKey) => {
					mp = new MercadoPago(publicKey, {
						locale: 'es-AR',
					});
				})
				.catch((error) =>
					console.error(
						`No es posible obtener la clave pública de Mercado Pago. Error ${error}`
					)
				);
		};
		getMpPublicKey();

		// Mostrar loader mientras se carga el botón
		waitingPurchasingProcess.classList.remove('d-none');

		// Mensajes informativos
		const purchaseDetailOk = document.querySelector('#purchaseDetailOk');
		const purchaseDetailFail = document.querySelector('#purchaseDetailFail');

		// Crear orden de pago y renderizar botón de Mercado Pago
		fetch(`/api/mp/createorder/${cartID}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((response) => {
				if (response.status === 400) {
					waitingPurchasingProcess.classList.add('d-none');
					purchaseDetailFail.classList.remove('d-none');
				} else if (response.ok) {
					return response.json();
				}
			})
			.then((data) => {
				if (data) {
					waitingPurchasingProcess.classList.add('d-none');
					purchaseDetailOk.classList.remove('d-none');
					orderId = data.id;
					createCheckoutButton(orderId);
				}
			})
			.catch((error) =>
				console.error(
					`No es posible obtener la Id de la orden de compra. Error ${error}`
				)
			);
	};
}

// Función para renderizar el botón de Mercado Pago
const createCheckoutButton = (preferenceId) => {
	const bricksBuilder = mp.bricks();

	const renderComponent = async () => {
		if (window.checkoutButton) window.checkoutButton.unmount();

		await bricksBuilder.create('wallet', 'wallet_container', {
			initialization: {
				preferenceId: preferenceId,
			},
		});
	};
	renderComponent();
	// Ocultar loader
	waitingPurchasingProcess.classList.add('d-none');
};

// Función del botón para vaciar el carrito
const btnEmptyCart = document.querySelector('#btnEmptyCart');
if (btnEmptyCart) {
	btnEmptyCart.onclick = () => {
		fetch(`/api/carts/${cartID}`, {
			method: 'delete',
		})
			.then((res) => refreshCartPage(cartID))
			.catch((error) =>
				console.error(
					`It was not possible to empty the cart. Error ${error}`
				)
			);
	};
}

adminView();
