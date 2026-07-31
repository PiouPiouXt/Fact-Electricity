import express from 'express';
import {
  getDevices,
  getCustomDevicesCtrl,
  addCustomDevice,
  deleteCustomDeviceCtrl,
  customDeviceValidation,
} from '../controllers/deviceController.js';

const router = express.Router();

router.get('/', getDevices);
router.get('/custom', getCustomDevicesCtrl);
router.post('/custom', customDeviceValidation, addCustomDevice);
router.delete('/custom/:id', deleteCustomDeviceCtrl);

export default router;
