import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // dependencia para generar ids únicas

const collectionName = 'tickets';

const ticketSchema = new mongoose.Schema({
	code: {
		type: String,
		unique: true,
		default: function () {
			return 'TKT_' + uuidv4(); // autogenera un código único
		},
	},
	purchase_datetime: {
		type: Date,
		default: Date.now, // fecha y hora de la compra
	},
	amount: Number,
	purchaser: String,
});

const ticketModel = mongoose.model(collectionName, ticketSchema);

export default ticketModel;
