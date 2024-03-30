import mongoose from 'mongoose';

const collectionName = 'users';

const userSchema = new mongoose.Schema({
	name: String,
	lastname: String,
	email: {
		type: String,
		unique: true,
		required: true,
		index: true,
	},
	age: Number,
	password: String,
	cart: {
		type: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'carts',
			},
		],
	},
	role: {
		type: String,
		default: 'USER',
	},
	documents: {
		type: [
			{
				name: String,
				reference: String,
			},
		],
		default: [],
	},
	last_connection: {
		type: Date,
		default: Date.now(),
	},
});

const userModel = mongoose.model(collectionName, userSchema);

export default userModel;
