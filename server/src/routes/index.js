import express from 'express';
const router = express.Router();
import productRouter from './productRouter.js';
import authRouter from './authRouter.js'

router.use('/products', productRouter);
router.use('/auth', authRouter);

export default router;