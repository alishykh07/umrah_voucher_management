import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import publicVoucherRoutes from './routes/publicVoucherRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

const allowedOrigins = process.env.CLIENT_URL?.split(',').map((origin) => origin.trim()) || [];
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  credentials: true,
}));
app.use('/uploads', express.static('uploads', { setHeaders(response) { response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); } }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: 'draft-8', legacyHeaders: false }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicVoucherRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
