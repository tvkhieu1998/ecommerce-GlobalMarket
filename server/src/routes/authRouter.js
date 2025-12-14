import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
const {register, login, logout} = authController ;
import { authenticateToken } from '../middlewares/authMiddleware.js';

router.post("/register", register);
router.post("/login", login);
router.post ("/logout",authenticateToken, logout);

export default router;