import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!SECRET_KEY) {
  console.error('VITE_ENCRYPTION_KEY is not set in environment variables');
}

export function encrypt(text: string): string {
  try {
    if (!SECRET_KEY) {
      throw new Error('Encryption key is not set');
    }
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Return original text if encryption fails
  }
}

export function decrypt(ciphertext: string): string {
  try {
    if (!SECRET_KEY) {
      throw new Error('Encryption key is not set');
    }
    if (!ciphertext) {
      return '';
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    console.error('Failed to decrypt:', ciphertext);
    return ciphertext; // Return original text if decryption fails
  }
}

// Encrypt specific fields of an object
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const encryptedData = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (typeof data[field] === 'string') {
      try {
        encryptedData[field] = encrypt(data[field] as string) as any;
      } catch (error) {
        console.error(`Failed to encrypt field ${String(field)}:`, error);
      }
    }
  }
  
  return encryptedData;
}