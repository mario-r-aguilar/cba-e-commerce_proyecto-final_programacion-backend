import { Command } from 'commander';
import dotenv from 'dotenv';
import { devLogger } from '../utils/logger.js';
dotenv.config();

// Se usa para poder seleccionar la persistencia desde la línea de comando
const program = new Command();
program.option('-p, --persistence <persistence>', 'Persistence');
program.parse();
const options = program.opts();

// Guarda y exporta la persistencia seleccionada
const selectedPersistence = {
	persistence: options.persistence || 'MONGO', // Si no se selecciona ninguna por defecto es MONGO
	error: function (message, error) {
		devLogger.error(message, error);
	},
};

export default selectedPersistence;
