import express from 'express';
import { register, login, logout, me, registerValidation, loginValidation } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, me);

export default router;
