import express from 'express';
import { getUsage, saveUsage, saveSingleUsage, saveUsageValidation } from '../controllers/usageController.js';

const router = express.Router();

router.get('/', getUsage);
router.put('/', saveUsageValidation, saveUsage);
router.put('/:deviceKey', saveSingleUsage);

export default router;
