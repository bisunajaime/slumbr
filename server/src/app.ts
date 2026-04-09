import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { clerk } from './middlewares/auth';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(clerk);

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
