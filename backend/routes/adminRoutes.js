import express from 'express';
import { createStaffAccount, deleteStaffMember, getStaffList, updateStaffMember } from '../controllers/authController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-staff', protect, isAdmin, createStaffAccount);
router.get('/staff', protect, isAdmin, getStaffList);
router.put('/staff/:id', protect, isAdmin, updateStaffMember);
router.delete('/staff/:id', protect, isAdmin, deleteStaffMember);

export default router;