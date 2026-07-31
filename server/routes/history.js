import express from 'express';
import { listHistory, addEntry, deleteEntry, addEntryValidation } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', listHistory);
router.post('/', addEntryValidation, addEntry);
router.delete('/:id', deleteEntry);

export default router;
