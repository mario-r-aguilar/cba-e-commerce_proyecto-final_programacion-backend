export const productCreationErrorInfo = (product) => {
	return `
        Una o más propiedades del producto están incompletas:

		VERIFIQUE EL CONTENIDO INGRESADO
        title: ---> ${product.title}
	    description: ---> ${product.description}
	    code:---> ${product.code}
	    price: ---> ${product.price}
	    status: ---> ${product.status}
	    stock: ---> ${product.stock}
	    category: ---> ${product.category}
	    thumbnail: ---> ${product.thumbnail} 
        `;
};
