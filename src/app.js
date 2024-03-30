import express from 'express';
import handlebars from 'express-handlebars';
import { socketServer } from './utils/websocket.js';
import path from 'node:path';
import getDirname from './utils/utils.js';
import { addLogger, devLogger } from './utils/logger.js';
import { productRouter } from './routes/product.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { userRouter } from './routes/user.routes.js';
import { viewsRouter } from './routes/views.routes.js';
import { loggerTestRouter } from './routes/loggerTest.routes.js';
import { mercadoPagoRouter } from './routes/mercadoPago.routes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import config from './config/config.js';
import cors from 'cors';
import errorsHandler from './middlewares/errorsHandler.js';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const app = express();

// Permite que __dirname funcione por mas que cambie de ubicación el archivo desde donde se encuentra
const __dirname = getDirname(import.meta.url);

app.use('/static', express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addLogger);

// Inicializo cors
app.use(cors());

// Handlebars config
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');

// Inicializo cookie-parser
app.use(cookieParser());

// Configuración de session
app.use(
	session({
		secret: config.sessionSecret,
		resave: true,
		saveUninitialized: true,
	})
);

// Inicializo passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Swagger
const swaggerOptions = {
	definition: {
		openapi: '3.0.1',
		info: {
			title: 'API para e-commerce',
			description:
				'Documentación de API desarrollada para ser utilizada por un e-commerce',
		},
	},
	apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJsDoc(swaggerOptions);

// Routes
app.use('/api/sessions', userRouter);
app.use('/api/products/', productRouter);
app.use('/api/carts/', cartRouter);
app.use('/', viewsRouter);
app.use('/api/loggertest', loggerTestRouter);
app.use('/api/mp', mercadoPagoRouter);
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Manejador de errores
app.use(errorsHandler);

const httpServer = app.listen(8080, () => {
	devLogger.info('Server online and listening');
});

// Ejecuta función para inicializar socket.io
socketServer(httpServer);
