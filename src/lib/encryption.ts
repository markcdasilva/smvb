import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-min-32-chars-long';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Encrypt specific fields of an object
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const encryptedData = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (typeof data[field] === 'string') {
      encryptedData[field] = encrypt(data[field] as string) as any;
    }
  }
  
  return encryptedData;
}