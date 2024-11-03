import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  throw new Error('VITE_ENCRYPTION_KEY is not set in environment variables');
}

export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY);
    return encrypted.toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';
  
  try {
    // Check if the ciphertext is in the correct format
    if (!ciphertext.includes('U2FsdGVk')) {
      return ciphertext; // Return as-is if not encrypted
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    // Validate decrypted result
    if (!decrypted && ciphertext) {
      console.error('Decryption produced empty result for:', ciphertext);
      return 'Decryption Error';
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return 'Decryption Error';
  }
}