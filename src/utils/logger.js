import winston from 'winston';
import config from '../config/config.js';

const customLevelsOptions = {
	levels: {
		fatal: 0,
		error: 1,
		warning: 2,
		info: 3,
		http: 4,
		debug: 5,
	},
	colors: {
		fatal: 'red',
		error: 'magenta',
		warning: 'yellow',
		info: 'cyan',
		http: 'green',
		debug: 'grey',
	},
};

export const devLogger = winston.createLogger({
	levels: customLevelsOptions.levels,
	transports: [
		new winston.transports.Console({
			level: 'debug',
			format: winston.format.combine(
				winston.format.colorize({
					colors: customLevelsOptions.colors,
				}),
				winston.format.simple()
			),
		}),
	],
});

const prodLogger = winston.createLogger({
	levels: customLevelsOptions.levels,
	transports: [
		new winston.transports.Console({
			level: 'info',
			format: winston.format.combine(
				winston.format.colorize({
					colors: customLevelsOptions.colors,
				}),
				winston.format.simple()
			),
		}),

		new winston.transports.File({
			filename: './src/logs/errors.log',
			level: 'error',
			format: winston.format.simple(),
		}),
	],
});

export const addLogger = (req, res, next) => {
	req.logger = config.environment === 'DEV' ? devLogger : prodLogger;

	if (config.environment === 'DEV') {
		req.logger.http(
			`${req.method} | Url: ${
				req.url
			} | ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
		);
	}

	next();
};
