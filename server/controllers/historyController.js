import { body, validationResult } from 'express-validator';
import { getAllHistory, addHistoryEntry, deleteHistoryEntry } from '../models/historyModel.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const addEntryValidation = [
  body('month').isInt({ min: 0, max: 11 }).withMessage('month must be 0–11'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('year must be 2000–2100'),
  body('cost').isFloat({ min: 0 }).withMessage('cost must be positive'),
  body('kwh').isFloat({ min: 0 }).withMessage('kwh must be positive'),
  body('is_auto').optional().isBoolean(),
];

export const listHistory = asyncHandler(async (req, res) => {
  const entries = await getAllHistory(req.user.id);
  res.json({ success: true, data: entries });
});

export const addEntry = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { month, year, cost, kwh, is_auto } = req.body;
  const entry = await addHistoryEntry(req.user.id, month, year, cost, kwh, is_auto === true);
  res.status(201).json({ success: true, data: entry });
});

export const deleteEntry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ok = await deleteHistoryEntry(req.user.id, parseInt(id, 10));
  if (!ok) {
    return res.status(404).json({ success: false, error: 'Entry not found' });
  }
  res.json({ success: true, data: { message: 'Entry deleted' } });
});
