import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getMyProfile, updateMyProfile, uploadMyProfileImage, removeMyProfileImage } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const tempDir = path.join(process.cwd(), 'uploads', 'temp');
		fs.mkdirSync(tempDir, { recursive: true });
		cb(null, tempDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.'), false);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
});

router.get('/profile', protect, getMyProfile);
router.put('/update-profile', protect, updateMyProfile);
router.post('/profile-image', protect, upload.single('image'), uploadMyProfileImage);
router.delete('/profile-image', protect, removeMyProfileImage);

export default router;
