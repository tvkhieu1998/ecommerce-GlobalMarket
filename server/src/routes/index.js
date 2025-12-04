import express from 'express';
const router = express.Router();
import productRouter from './productRouter.js';

router.use('/products', productRouter);

export default router;