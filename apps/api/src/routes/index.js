import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { vendorRouter } from './vendorRoutes.js';
import { leadRouter } from './leadRoutes.js';
import { reviewRouter } from './reviewRoutes.js';
import { adminRouter } from './adminRoutes.js';
import { uploadRouter } from './uploadRoutes.js';
import { userRouter } from './userRoutes.js';
import { blogRouter } from './blogRoutes.js';
import { altchaRouter } from './altchaRoutes.js';
import { contactRouter } from './contactRoutes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));

apiRouter.use('/auth', authRouter);
apiRouter.use('/vendors', vendorRouter);
apiRouter.use('/leads', leadRouter);
apiRouter.use('/reviews', reviewRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/upload', uploadRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/blog', blogRouter);
apiRouter.use('/altcha', altchaRouter);
apiRouter.use('/contact', contactRouter);
