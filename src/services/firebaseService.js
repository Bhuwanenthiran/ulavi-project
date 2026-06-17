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
    throw new Error('Firebase is not configured.');
  }
  
  const cleanContact = sanitizeContactForFirebase(contact);
  const docRef = doc(db, 'contacts', cleanContact.id);
  await setDoc(docRef, cleanContact);
  console.log(`[Firebase] Contact ${cleanContact.id} synced successfully.`);
  return true;
};

export const deleteContactFromFirebase = async (contactId) => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured.');
  }
  
  const docRef = doc(db, 'contacts', String(contactId));
  await deleteDoc(docRef);
  console.log(`[Firebase] Contact ${contactId} deleted successfully.`);
  return true;
};

export const syncFolderToFirebase = async (folder) => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured.');
  }
  
  const cleanFolder = sanitizeFolderForFirebase(folder);
  const docRef = doc(db, 'folders', cleanFolder.id);
  await setDoc(docRef, cleanFolder);
  console.log(`[Firebase] Folder ${cleanFolder.id} synced successfully.`);
  return true;
};

export const deleteFolderFromFirebase = async (folderId) => {
  if (!isFirebaseAvailable()) {
    throw new Error('Firebase is not configured.');
  }
  
  const docRef = doc(db, 'folders', String(folderId));
  await deleteDoc(docRef);
  console.log(`[Firebase] Folder ${folderId} deleted successfully.`);
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
