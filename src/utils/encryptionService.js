// Encryption Service for IndexedDB using browser's Web Crypto API (AES-GCM)

const ENCRYPTION_KEY_NAME = '_cc_enc_key';

/**
 * Converts an ArrayBuffer to a Base64 string.
 */
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 */
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Retrieves or generates the CryptoKey for AES-GCM.
 * The key is stored in localStorage as a raw base64 string and imported on demand.
 */
async function getOrCreateEncryptionKey() {
  let rawKeyBase64 = localStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (!rawKeyBase64) {
    // Generate a new 256-bit AES key
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
    
    // Export the key to raw format and save in localStorage
    const rawKey = await window.crypto.subtle.exportKey('raw', key);
    rawKeyBase64 = bufferToBase64(rawKey);
    localStorage.setItem(ENCRYPTION_KEY_NAME, rawKeyBase64);
  }

  const rawKeyBuffer = base64ToBuffer(rawKeyBase64);
  return window.crypto.subtle.importKey(
    'raw',
    rawKeyBuffer,
    { name: 'AES-GCM' },
    false, // not extractable from the returned key object
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plain JavaScript object.
 * Returns an object with the encrypted payload and metadata.
 */
export async function encryptData(plainObject) {
  try {
    if (!plainObject || typeof plainObject !== 'object') {
      return plainObject;
    }

    const key = await getOrCreateEncryptionKey();
    
    // Generate a unique 12-byte initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Serialize object to JSON
    const textEncoder = new TextEncoder();
    const encodedData = textEncoder.encode(JSON.stringify(plainObject));
    
    // Encrypt using AES-GCM
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );
    
    console.log('[Encryption] Encrypt successful');
    
    return {
      __encrypted: true,
      id: plainObject.id, // Keep ID in plaintext for IndexedDB retrieval if needed/applicable
      iv: bufferToBase64(iv),
      data: bufferToBase64(encryptedBuffer)
    };
  } catch (error) {
    console.error('[Encryption] Encrypt failed:', error);
    throw error;
  }
}

/**
 * Decrypts an encrypted object back to its original form.
 */
export async function decryptData(encryptedObject) {
  try {
    if (!isEncrypted(encryptedObject)) {
      return encryptedObject;
    }
    
    const key = await getOrCreateEncryptionKey();
    
    const iv = new Uint8Array(base64ToBuffer(encryptedObject.iv));
    const encryptedData = base64ToBuffer(encryptedObject.data);
    
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );
    
    const textDecoder = new TextDecoder();
    const decryptedText = textDecoder.decode(decryptedBuffer);
    
    console.log('[Encryption] Decrypt successful');
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('[Encryption] Decrypt failed:', error);
    throw error;
  }
}

/**
 * Checks if a record is encrypted.
 */
export function isEncrypted(record) {
  return record && record.__encrypted === true && typeof record.iv === 'string' && typeof record.data === 'string';
}
