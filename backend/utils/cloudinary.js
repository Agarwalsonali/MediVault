import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables in this module
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing Cloudinary environment variables:', missingVars.join(', '));
  console.error('Please ensure .env file contains all required Cloudinary credentials');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('✅ Cloudinary configured successfully');
}

export default cloudinary;