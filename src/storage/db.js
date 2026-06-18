import { openDB } from 'idb';
import { encryptData, decryptData, isEncrypted } from '../utils/encryptionService';

const DB_NAME = 'cardconnect-db';
const DB_VERSION = 2;

let dbPromise = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Helper function to handle transparent decryption and migration of old records
async function processReadItem(item, storeName) {
  if (!item) return item;
  if (isEncrypted(item)) {
    return decryptData(item);
  }
  
  // Unencrypted old record: migrate it!
  try {
    console.log(`[Encryption] Migration triggered for ${storeName} record:`, item.id);
    const db = await initDB();
    const encrypted = await encryptData(item);
    await db.put(storeName, encrypted);
    console.log(`[Encryption] Migration completed for ${storeName} record:`, item.id);
  } catch (err) {
    console.error(`[Encryption] Migration failed for ${storeName} record:`, item.id, err);
  }
  return item;
}

export const getContactsFromDB = async () => {
  const db = await initDB();
  const rawList = await db.getAll('contacts');
  return Promise.all(rawList.map(item => processReadItem(item, 'contacts')));
};

export const saveContactToDB = async (contact) => {
  const db = await initDB();
  const encrypted = await encryptData(contact);
  return db.put('contacts', encrypted);
};

export const deleteContactFromDB = async (id) => {
  const db = await initDB();
  return db.delete('contacts', id);
};

export const getFoldersFromDB = async () => {
  const db = await initDB();
  const rawList = await db.getAll('folders');
  return Promise.all(rawList.map(item => processReadItem(item, 'folders')));
};

export const saveFolderToDB = async (folder) => {
  const db = await initDB();
  const encrypted = await encryptData(folder);
  return db.put('folders', encrypted);
};

export const deleteFolderFromDB = async (id) => {
  const db = await initDB();
  return db.delete('folders', id);
};

export const addActionToQueue = async (action) => {
  const db = await initDB();
  const rawAction = { ...action, timestamp: Date.now() };
  const encrypted = await encryptData(rawAction);
  return db.add('queue', encrypted);
};

export const getQueue = async () => {
  const db = await initDB();
  const rawList = await db.getAll('queue');
  return Promise.all(rawList.map(item => processReadItem(item, 'queue')));
};

export const removeActionFromQueue = async (id) => {
  const db = await initDB();
  return db.delete('queue', id);
};

export const updateQueueItem = async (item) => {
  const db = await initDB();
  const encrypted = await encryptData(item);
  return db.put('queue', encrypted);
};

export const clearQueue = async () => {
  const db = await initDB();
  return db.clear('queue');
};

