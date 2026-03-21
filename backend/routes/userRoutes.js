import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getMyProfile);
router.put('/update-profile', protect, updateMyProfile);

export default router;
