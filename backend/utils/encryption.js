import crypto from "crypto";
import { createFeatureLogger } from "./logger.js";

const encryptionLogger = createFeatureLogger("encryption");

/**
 * Encryption Configuration
 * Using AES-256-CBC for strong file encryption
 */
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

// Validate encryption key
if (!process.env.ENCRYPTION_KEY) {
  encryptionLogger.warn(
    "ENCRYPTION_KEY not set in environment. Using randomly generated key. " +
    "Set ENCRYPTION_KEY in .env for persistent encryption/decryption across restarts."
  );
}

/**
 * Derive encryption key from environment or generate new one
 * Must be 32 bytes for AES-256
 */
const getEncryptionKey = () => {
  if (process.env.ENCRYPTION_KEY) {
    // If key is hex string, convert to buffer
    if (process.env.ENCRYPTION_KEY.length === 64) {
      return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    }
    // Otherwise use as is (should be 32 bytes)
    const key = Buffer.from(process.env.ENCRYPTION_KEY);
    if (key.length !== 32) {
      encryptionLogger.warn(
        `ENCRYPTION_KEY is ${key.length} bytes. AES-256 requires 32 bytes. Hashing to correct size.`
      );
      return crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest();
    }
    return key;
  }
  return Buffer.from(ENCRYPTION_KEY, "hex");
};

/**
 * Encrypts a file buffer using AES-256-CBC
 * 
 * @param {Buffer} fileBuffer - The file to encrypt
 * @returns {Object} { encryptedBuffer, iv }
 *   - encryptedBuffer: Encrypted file data (Buffer)
 *   - iv: Initialization vector as hex string (16 bytes)
 * 
 * @throws {Error} If encryption fails
 * 
 * @example
 * const { encryptedBuffer, iv } = encryptFile(pdfBuffer);
 * // Store iv in database with report metadata
 * // Save encryptedBuffer to cloud storage
 */
export const encryptFile = (fileBuffer) => {
  try {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      throw new Error("File buffer is required and must be a Buffer");
    }

    // Generate random IV (16 bytes for AES-256-CBC)
    const iv = crypto.randomBytes(16);

    // Get encryption key
    const key = getEncryptionKey();

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the file
    let encryptedBuffer = cipher.update(fileBuffer);
    encryptedBuffer = Buffer.concat([encryptedBuffer, cipher.final()]);

    encryptionLogger.info("File encrypted successfully", {
      originalSize: fileBuffer.length,
      encryptedSize: encryptedBuffer.length,
      ivLength: iv.length,
      algorithm: ALGORITHM
    });

    return {
      encryptedBuffer,
      iv: iv.toString("hex")
    };
  } catch (error) {
    encryptionLogger.error("File encryption failed", {
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypts a file buffer using AES-256-CBC
 * 
 * @param {Buffer} encryptedBuffer - The encrypted file to decrypt
 * @param {string} ivHex - Initialization vector as hex string (retrieved from database)
 * @returns {Buffer} Decrypted file data
 * 
 * @throws {Error} If decryption fails
 * 
 * @example
 * const decryptedBuffer = decryptFile(encryptedBuffer, storedIV);
 * res.download(decryptedBuffer, fileName);
 */
export const decryptFile = (encryptedBuffer, ivHex) => {
  try {
    if (!encryptedBuffer || !Buffer.isBuffer(encryptedBuffer)) {
      throw new Error("Encrypted buffer is required and must be a Buffer");
    }

    if (!ivHex || typeof ivHex !== "string") {
      throw new Error("IV (hex string) is required for decryption");
    }

    // Convert hex IV back to buffer
    const iv = Buffer.from(ivHex, "hex");

    if (iv.length !== 16) {
      throw new Error(`IV must be 16 bytes, got ${iv.length}`);
    }

    // Get encryption key
    const key = getEncryptionKey();

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt the file
    let decryptedBuffer = decipher.update(encryptedBuffer);
    decryptedBuffer = Buffer.concat([decryptedBuffer, decipher.final()]);

    encryptionLogger.info("File decrypted successfully", {
      encryptedSize: encryptedBuffer.length,
      decryptedSize: decryptedBuffer.length,
      algorithm: ALGORITHM
    });

    return decryptedBuffer;
  } catch (error) {
    encryptionLogger.error("File decryption failed", {
      error: error.message,
      stack: error.stack,
      ivLength: ivHex?.length
    });
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Encrypts a file and returns it ready for storage
 * Combines encryption with size/metadata extraction
 * 
 * @param {Buffer} fileBuffer - The file to encrypt
 * @returns {Object} { encryptedBuffer, iv, encryptedSize, originalSize }
 */
export const prepareEncryptedFile = (fileBuffer) => {
  const originalSize = fileBuffer.length;
  const { encryptedBuffer, iv } = encryptFile(fileBuffer);
  const encryptedSize = encryptedBuffer.length;

  return {
    encryptedBuffer,
    iv,
    encryptedSize,
    originalSize,
    compressionRatio: ((1 - encryptedSize / originalSize) * 100).toFixed(2)
  };
};

/**
 * Validates encryption configuration
 * Use on server startup to ensure encryption is properly configured
 * 
 * @returns {Object} { isValid, warnings, errors }
 */
export const validateEncryptionConfig = () => {
  const warnings = [];
  const errors = [];

  try {
    const key = getEncryptionKey();

    if (key.length !== 32) {
      errors.push(`Encryption key must be 32 bytes, got ${key.length}`);
    }

    if (!process.env.ENCRYPTION_KEY) {
      warnings.push(
        "ENCRYPTION_KEY not set in .env. Using randomly generated key. " +
        "Files encrypted with random keys cannot be decrypted after server restart."
      );
    }

    // Test encryption/decryption
    const testBuffer = Buffer.from("test medical data 12345");
    const { encryptedBuffer, iv } = encryptFile(testBuffer);
    const decrypted = decryptFile(encryptedBuffer, iv);

    if (!testBuffer.equals(decrypted)) {
      errors.push("Encryption/Decryption test failed - data mismatch");
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      algorithm: ALGORITHM,
      keySize: key.length * 8, // Convert bytes to bits
      ivSize: 16 * 8
    };
  } catch (error) {
    return {
      isValid: false,
      warnings,
      errors: [`Encryption validation failed: ${error.message}`],
      algorithm: ALGORITHM
    };
  }
};

/**
 * Gets encryption configuration info (safe to log)
 * Does not expose the actual key
 * 
 * @returns {Object} Configuration details
 */
export const getEncryptionInfo = () => {
  return {
    algorithm: ALGORITHM,
    keySize: "256-bit",
    ivSize: "128-bit (16 bytes)",
    keyConfigured: !!process.env.ENCRYPTION_KEY,
    mode: "CBC",
    autoPadding: true
  };
};

export default {
  encryptFile,
  decryptFile,
  prepareEncryptedFile,
  validateEncryptionConfig,
  getEncryptionInfo
};
