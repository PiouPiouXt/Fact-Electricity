import { body, validationResult } from 'express-validator';
import {
  getBuiltInApps,
  getCustomDevices,
  createCustomDevice,
  deleteCustomDevice,
} from '../models/deviceModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const customDeviceValidation = [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name required (max 50 chars)'),
  body('watts').isInt({ min: 1, max: 10000 }).withMessage('Watts must be 1–10000'),
  body('icon').optional().trim(),
];

export const getDevices = asyncHandler(async (req, res) => {
  const builtIn = getBuiltInApps();
  const customs = await getCustomDevices(req.user.id);
  res.json({ success: true, data: { builtIn, customs } });
});

export const getCustomDevicesCtrl = asyncHandler(async (req, res) => {
  const customs = await getCustomDevices(req.user.id);
  res.json({ success: true, data: customs });
});

export const addCustomDevice = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { name, watts, icon } = req.body;
  const device = await createCustomDevice(req.user.id, name, watts, icon || '🔌');
  res.status(201).json({ success: true, data: device });
});

export const deleteCustomDeviceCtrl = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ok = await deleteCustomDevice(req.user.id, parseInt(id, 10));
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }
  res.json({ success: true, data: { message: 'Device deleted' } });
});
