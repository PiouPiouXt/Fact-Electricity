import { body, validationResult } from 'express-validator';
import { getSettings, upsertSettings } from '../models/settingsModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const settingsValidation = [
  body('theme').optional().isIn(['dark', 'light']).withMessage('theme must be dark or light'),
  body('currency').optional().trim().isLength({ min: 1, max: 10 }),
  body('language').optional().trim().isLength({ min: 2, max: 5 }),
];

export const getSettingsCtrl = asyncHandler(async (req, res) => {
  const settings = await getSettings(req.user.id);
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const settings = await upsertSettings(req.user.id, req.body);
  res.json({ success: true, data: settings });
});
