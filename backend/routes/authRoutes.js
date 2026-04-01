import express from 'express'
import { registerUser, loginUser, verifyOTP, forgotPassword, resetPassword, verifyEmail, resendVerificationOtp, logoutUser, setPasswordFromInvite } from '../controllers/authController.js'

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/set-password', setPasswordFromInvite);

export default router;