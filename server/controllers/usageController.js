import { body, validationResult } from 'express-validator';
import { getDeviceTimes, saveDeviceTime, saveAllDeviceTimes } from '../models/usageModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const saveUsageValidation = [
  body('times').isObject().withMessage('times object required'),
  body('times.*').isFloat({ min: 0, max: 24 }).withMessage('Each hours value must be 0–24'),
];

export const getUsage = asyncHandler(async (req, res) => {
  const times = await getDeviceTimes(req.user.id);
  res.json({ success: true, data: { times } });
});

export const saveUsage = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { times } = req.body;
  const results = await saveAllDeviceTimes(req.user.id, times);
  res.json({ success: true, data: { times: results } });
});

export const saveSingleUsage = asyncHandler(async (req, res) => {
  const { deviceKey } = req.params;
  const hours = parseFloat(req.body.hours);

  if (isNaN(hours) || hours < 0 || hours > 24) {
    return res.status(400).json({ success: false, error: 'Hours must be 0–24' });
  }

  const result = await saveDeviceTime(req.user.id, deviceKey, hours);
  res.json({ success: true, data: result });
});
