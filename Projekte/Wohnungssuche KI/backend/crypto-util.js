import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const DEFAULT_SECRET = process.env.ENCRYPTION_SECRET || 'wohnungssuche-ki-default-encryption-secret-key-32bytes';

function getKey(customSecret) {
  const secret = customSecret || DEFAULT_SECRET;
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Verschlüsselt einen String mit AES-256-CBC.
 * @param {string} text - Der zu verschlüsselnde Klartext
 * @param {string} [customSecret] - Optionaler individueller Schlüssel
 * @returns {string} Hex-kodierter String enthaltend IV:encrypted
 */
export function encryptText(text, customSecret) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const key = getKey(customSecret);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(Buffer.from(text, 'utf8')), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Entschlüsselt einen AES-256-CBC verschlüsselten String.
 * @param {string} encryptedData - Der verschlüsselte String im Format iv:encrypted
 * @param {string} [customSecret] - Optionaler individueller Schlüssel
 * @returns {string} Entschlüsselter Klartext
 */
export function decryptText(encryptedData, customSecret) {
  if (!encryptedData || typeof encryptedData !== 'string' || !encryptedData.includes(':')) return encryptedData;
  try {
    const colonIdx = encryptedData.indexOf(':');
    const iv = Buffer.from(encryptedData.substring(0, colonIdx), 'hex');
    const encrypted = Buffer.from(encryptedData.substring(colonIdx + 1), 'hex');
    
    const key = getKey(customSecret);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('[CryptoUtil] Fehler bei der Entschlüsselung:', error.message);
    return encryptedData;
  }
}

/**
 * Verschlüsselt einen Buffer (z. B. PDF-Datei).
 * @param {Buffer} buffer 
 * @param {string} [customSecret] 
 * @returns {Buffer} 
 */
export function encryptBuffer(buffer, customSecret) {
  if (!buffer) return buffer;
  const hex = Buffer.isBuffer(buffer) ? buffer.toString('hex') : Buffer.from(buffer).toString('hex');
  const encText = encryptText(hex, customSecret);
  return Buffer.from(encText, 'utf8');
}

/**
 * Entschlüsselt einen verschlüsselten Buffer.
 * @param {Buffer} encryptedBuffer 
 * @param {string} [customSecret] 
 * @returns {Buffer} 
 */
export function decryptBuffer(encryptedBuffer, customSecret) {
  if (!encryptedBuffer) return encryptedBuffer;
  try {
    const encText = Buffer.isBuffer(encryptedBuffer) ? encryptedBuffer.toString('utf8') : String(encryptedBuffer);
    if (!encText.includes(':')) return encryptedBuffer;
    const decHex = decryptText(encText, customSecret);
    return Buffer.from(decHex, 'hex');
  } catch (error) {
    console.error('[CryptoUtil] Fehler bei Buffer-Entschlüsselung:', error.message);
    return encryptedBuffer;
  }
}
