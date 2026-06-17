import { 
  syncContactToFirebase, 
  deleteContactFromFirebase, 
  syncFolderToFirebase, 
  deleteFolderFromFirebase,
  fetchContactsFromFirebase,
  fetchFoldersFromFirebase
} from './firebaseService';
import { 
  getContactsFromDB, 
  saveContactToDB, 
  getFoldersFromDB, 
  saveFolderToDB 
} from '../storage/db';
import { isFirebaseAvailable } from '../config/firebase';

export const performStartupSync = async () => {
  if (!isFirebaseAvailable() || !navigator.onLine) {
    return;
  }
  
  console.log('[FirebaseSync] Running startup sync...');
  
  try {
    const firestoreFolders = await fetchFoldersFromFirebase();
    const localFolders = await getFoldersFromDB();
    const localFoldersMap = new Map(localFolders.map(f => [f.id, f]));
    let updatedAny = false;
    
    for (const fFolder of firestoreFolders) {
      const lFolder = localFoldersMap.get(fFolder.id);
      if (!lFolder) {
        fFolder.syncStatus = 'synced';
        await saveFolderToDB(fFolder);
        updatedAny = true;
      } else {
        const fTime = new Date(fFolder.updatedAt || 0).getTime();
        const lTime = new Date(lFolder.updatedAt || 0).getTime();
        if (fTime > lTime) {
          fFolder.syncStatus = 'synced';
          await saveFolderToDB(fFolder);
          updatedAny = true;
        }
      }
    }
    
    const firestoreContacts = await fetchContactsFromFirebase();
    const localContacts = await getContactsFromDB();
    const localContactsMap = new Map(localContacts.map(c => [c.id, c]));
    
    for (const fContact of firestoreContacts) {
      const lContact = localContactsMap.get(fContact.id);
      if (!lContact) {
        fContact.syncStatus = 'synced';
        await saveContactToDB(fContact);
        updatedAny = true;
      } else {
        const fTime = new Date(fContact.updatedAt || 0).getTime();
        const lTime = new Date(lContact.updatedAt || 0).getTime();
        if (fTime > lTime) {
          fContact.syncStatus = 'synced';
          await saveContactToDB(fContact);
          updatedAny = true;
        }
      }
    }
    
    console.log('[FirebaseSync] Startup sync complete. Changes applied:', updatedAny);
    if (updatedAny && onSyncUpdateCallback) {
      onSyncUpdateCallback();
    }
    
    // Trigger background upload for anything newer locally
    triggerFirebaseSync();
  } catch (err) {
    console.error('[FirebaseSync] Error in startup sync:', err);
  }
};

let isSyncing = false;
let onSyncUpdateCallback = null;

// Register callback to update React state when background sync modifies records
export const registerSyncCallback = (callback) => {
  onSyncUpdateCallback = callback;
};

// Queue a deletion for offline sync
export const queueFirebaseDeletion = (id, type) => {
  try {
    const list = JSON.parse(localStorage.getItem('firebasePendingDeletions') || '[]');
    list.push({ id, type, timestamp: Date.now() });
    localStorage.setItem('firebasePendingDeletions', JSON.stringify(list));
    console.log(`[FirebaseSync] Queued deletion for ${type} ${id}`);
  } catch (err) {
    console.error('[FirebaseSync] Error queueing deletion:', err);
  }
};

// Process pending deletions
const processPendingDeletions = async () => {
  if (!isFirebaseAvailable()) return;
  
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('firebasePendingDeletions') || '[]');
  } catch (err) {
    console.error(err);
  }
  
  if (list.length === 0) return;
  
  console.log(`[FirebaseSync] Processing ${list.length} pending deletions...`);
  const remaining = [];
  
  for (const item of list) {
    try {
      if (item.type === 'contact') {
        await deleteContactFromFirebase(item.id);
      } else if (item.type === 'folder') {
        await deleteFolderFromFirebase(item.id);
      }
    } catch (err) {
      console.warn(`[FirebaseSync] Deletion failed for ${item.type} ${item.id}, will retry later.`, err);
      remaining.push(item);
    }
  }
  
  localStorage.setItem('firebasePendingDeletions', JSON.stringify(remaining));
};

// Main background sync function
export const triggerFirebaseSync = async () => {
  if (isSyncing) return;
  if (!navigator.onLine) {
    console.log('[FirebaseSync] Device is offline. Skipping cloud sync.');
    return;
  }
  if (!isFirebaseAvailable()) {
    return;
  }
  
  isSyncing = true;
  console.log('[FirebaseSync] Starting cloud sync cycle...');
  
  try {
    // 1. Process deletions first
    await processPendingDeletions();
    
    let updatedLocalContacts = false;
    let updatedLocalFolders = false;
    
    // 2. Sync pending folders
    const localFolders = await getFoldersFromDB();
    const pendingFolders = localFolders.filter(f => f.syncStatus !== 'synced');
    console.log(`[FirebaseSync] Folders loaded from IndexedDB: ${localFolders.length}, pending folders selected for upload: ${pendingFolders.length}`);
    
    for (const folder of localFolders) {
      if (folder.syncStatus !== 'synced') {
        try {
          await syncFolderToFirebase(folder);
          folder.syncStatus = 'synced';
          folder.updatedAt = new Date().toISOString();
          await saveFolderToDB(folder);
          updatedLocalFolders = true;
        } catch (err) {
          console.warn(`[FirebaseSync] Failed to sync folder ${folder.id}`, err);
        }
      } else {
        console.log(`[FirebaseSync] Skipping folder sync. ID: ${folder.id}, Name: "${folder.name}" because syncStatus is already 'synced'.`);
      }
    }
    
    // 3. Sync pending contacts
    const localContacts = await getContactsFromDB();
    const pendingContacts = localContacts.filter(c => c.syncStatus !== 'synced');
    console.log(`[FirebaseSync] Contacts loaded from IndexedDB: ${localContacts.length}, pending contacts selected for upload: ${pendingContacts.length}`);
    
    for (const contact of localContacts) {
      if (contact.syncStatus !== 'synced') {
        try {
          await syncContactToFirebase(contact);
          contact.syncStatus = 'synced';
          contact.updatedAt = new Date().toISOString();
          await saveContactToDB(contact);
          updatedLocalContacts = true;
        } catch (err) {
          console.warn(`[FirebaseSync] Failed to sync contact ${contact.id}`, err);
        }
      } else {
        console.log(`[FirebaseSync] Skipping contact sync. ID: ${contact.id}, Name: "${contact.name}" because syncStatus is already 'synced'.`);
      }
    }
    
    // If any status got updated, notify React components to reload state
    if ((updatedLocalContacts || updatedLocalFolders) && onSyncUpdateCallback) {
      onSyncUpdateCallback();
    }
    
    console.log('[FirebaseSync] Cloud sync cycle finished.');
  } catch (err) {
    console.error('[FirebaseSync] Error in sync cycle:', err);
  } finally {
    isSyncing = false;
  }
};

// Initialize listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[FirebaseSync] Network online detected. Triggering sync.');
    triggerFirebaseSync();
  });
  
  // Periodic background check every 30 seconds
  setInterval(() => {
    triggerFirebaseSync();
  }, 30000);
}
