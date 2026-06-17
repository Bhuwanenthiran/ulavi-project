import { db, isFirebaseAvailable } from '../config/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

// Helper to remove any non-serializable fields (like Blobs, functions) before saving to Firestore
const sanitizeContactForFirebase = (contact) => {
  const clean = { ...contact };
  
  // Make sure ID is a string for document reference
  if (clean.id) {
    clean.id = String(clean.id);
  }
  
  // Remove non-serializable properties
  delete clean.imageBlob;
  delete clean.previewUrl;
  
  // Clean undefined values
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) {
      clean[key] = null;
    }
  });
  
  return clean;
};

// Helper to sanitize folder
const sanitizeFolderForFirebase = (folder) => {
  const clean = { ...folder };
  if (clean.id) {
    clean.id = String(clean.id);
  }
  
  Object.keys(clean).forEach(key => {
    if (clean[key] === undefined) {
      clean[key] = null;
    }
  });
  
  return clean;
};

export const syncContactToFirebase = async (contact) => {
  if (!isFirebaseAvailable()) {
    console.error('[Firebase] syncContactToFirebase failed: Firebase is not initialized or configured.');
    throw new Error('Firebase is not configured.');
  }
  
  const cleanContact = sanitizeContactForFirebase(contact);
  const docRef = doc(db, 'contacts', cleanContact.id);
  console.log(`[Firebase] Attempting to sync contact. ID: ${cleanContact.id}, Collection: contacts`, cleanContact);
  try {
    await setDoc(docRef, cleanContact);
    console.log(`[Firebase] SUCCESS: Sync contact completed successfully. ID: ${cleanContact.id}, Collection: contacts`);
  } catch (error) {
    console.error(`[Firebase] FAILURE: Sync contact failed. ID: ${cleanContact.id}, Collection: contacts. Error:`, error.stack || error);
    throw error;
  }
  return true;
};

export const deleteContactFromFirebase = async (contactId) => {
  if (!isFirebaseAvailable()) {
    console.error('[Firebase] deleteContactFromFirebase failed: Firebase is not initialized or configured.');
    throw new Error('Firebase is not configured.');
  }
  
  const docRef = doc(db, 'contacts', String(contactId));
  console.log(`[Firebase] Attempting to delete contact. ID: ${contactId}, Collection: contacts`);
  try {
    await deleteDoc(docRef);
    console.log(`[Firebase] SUCCESS: Delete contact completed successfully. ID: ${contactId}, Collection: contacts`);
  } catch (error) {
    console.error(`[Firebase] FAILURE: Delete contact failed. ID: ${contactId}, Collection: contacts. Error:`, error.stack || error);
    throw error;
  }
  return true;
};

export const syncFolderToFirebase = async (folder) => {
  if (!isFirebaseAvailable()) {
    console.error('[Firebase] syncFolderToFirebase failed: Firebase is not initialized or configured.');
    throw new Error('Firebase is not configured.');
  }
  
  const cleanFolder = sanitizeFolderForFirebase(folder);
  const docRef = doc(db, 'folders', cleanFolder.id);
  console.log(`[Firebase] Attempting to sync folder. ID: ${cleanFolder.id}, Collection: folders`, cleanFolder);
  try {
    await setDoc(docRef, cleanFolder);
    console.log(`[Firebase] SUCCESS: Sync folder completed successfully. ID: ${cleanFolder.id}, Collection: folders`);
  } catch (error) {
    console.error(`[Firebase] FAILURE: Sync folder failed. ID: ${cleanFolder.id}, Collection: folders. Error:`, error.stack || error);
    throw error;
  }
  return true;
};

export const deleteFolderFromFirebase = async (folderId) => {
  if (!isFirebaseAvailable()) {
    console.error('[Firebase] deleteFolderFromFirebase failed: Firebase is not initialized or configured.');
    throw new Error('Firebase is not configured.');
  }
  
  const docRef = doc(db, 'folders', String(folderId));
  console.log(`[Firebase] Attempting to delete folder. ID: ${folderId}, Collection: folders`);
  try {
    await deleteDoc(docRef);
    console.log(`[Firebase] SUCCESS: Delete folder completed successfully. ID: ${folderId}, Collection: folders`);
  } catch (error) {
    console.error(`[Firebase] FAILURE: Delete folder failed. ID: ${folderId}, Collection: folders. Error:`, error.stack || error);
    throw error;
  }
  return true;
};

export const fetchContactsFromFirebase = async () => {
  if (!isFirebaseAvailable()) {
    return [];
  }
  
  const querySnapshot = await getDocs(collection(db, 'contacts'));
  const contacts = [];
  querySnapshot.forEach((doc) => {
    contacts.push(doc.data());
  });
  return contacts;
};

export const fetchFoldersFromFirebase = async () => {
  if (!isFirebaseAvailable()) {
    return [];
  }
  
  const querySnapshot = await getDocs(collection(db, 'folders'));
  const folders = [];
  querySnapshot.forEach((doc) => {
    folders.push(doc.data());
  });
  return folders;
};
