import express from 'express';
import { getSettingsCtrl, updateSettings, settingsValidation } from '../controllers/settingsController.js';

const router = express.Router();

router.get('/', getSettingsCtrl);
router.put('/', settingsValidation, updateSettings);

export default router;
