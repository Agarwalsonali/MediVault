import express from 'express'
import { registerUser, loginUser, verifyOTP, forgotPassword, resetPassword, verifyEmail, resendVerificationOtp } from '../controllers/authController.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;