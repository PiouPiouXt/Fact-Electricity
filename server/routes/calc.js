import express from 'express';
import {
  calculateBill,
  calculateInverse,
  calculateTotalKwh,
  getTariffInfo,
  billValidation,
  inverseValidation,
  totalKwhValidation,
} from '../controllers/calcController.js';

const router = express.Router();

router.get('/tariffs', getTariffInfo);
router.post('/bill', billValidation, calculateBill);
router.post('/inverse', inverseValidation, calculateInverse);
router.post('/total', totalKwhValidation, calculateTotalKwh);

export default router;
