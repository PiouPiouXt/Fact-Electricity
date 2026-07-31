import { body, validationResult } from 'express-validator';
import { createUser, getUserByEmail, userExists, verifyPassword } from '../models/userModel.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
  body('name').optional().trim().escape(),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { email, password, name } = req.body;

  if (await userExists(email)) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }

  const user = await createUser(email, password, name);

  const token = generateToken(user);
  res.status(201).json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name }, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, email: user.email });
  res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { message: 'Logout successful. Clear token on client.' } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: { id: req.user.id, email: req.user.email, name: req.user.name } },
  });
});
