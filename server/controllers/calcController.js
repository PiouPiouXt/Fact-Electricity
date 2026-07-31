import { body, validationResult } from 'express-validator';
import { calcBill, calcInverse, totalKwh, APPS } from '../utils/electricity.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const billValidation = [
  body('kwh').isFloat({ min: 0 }).withMessage('kwh must be a positive number'),
];

export const inverseValidation = [
  body('budget').isFloat({ min: 1 }).withMessage('budget must be a positive number'),
];

export const totalKwhValidation = [
  body('times').isArray().withMessage('times array required'),
  body('customs').isArray().withMessage('customs array required'),
];

export const calculateBill = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { kwh } = req.body;
  const bill = calcBill(kwh);
  res.json({ success: true, data: bill });
});

export const calculateInverse = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { budget } = req.body;
  const suggestions = calcInverse(budget);
  res.json({ success: true, data: { suggestions } });
});

export const calculateTotalKwh = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }

  const { times, customs } = req.body;
  const kwh = totalKwh(times, customs);
  const bill = calcBill(kwh);
  res.json({ success: true, data: { kwh, bill } });
});

export const getTariffInfo = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      apps: APPS,
      tariffs: {
        t1: { max: 130, rate: 350 },
        t2: { max: 300, rate: 580 },
        t3: { rate: 760 },
      },
    },
  });
});
