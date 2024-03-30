import { Router } from 'express';

const loggerTestRouter = Router();

loggerTestRouter.get('/', async (req, res) => {
	try {
		req.logger.fatal('fatal test');
		req.logger.error('error test');
		req.logger.warning('warning test');
		req.logger.info('info test');
		req.logger.http('http test');
		req.logger.debug('debug test');

		res.status(200).send('Endpoint for testing loggers');
	} catch (error) {
		res.status(500).send(`Internal Server Error: ${error}`);
	}
});

export { loggerTestRouter };
