import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
console.log("Firestore initialized with database ID:", firebaseConfig.firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence is not supported by this browser');
    }
  });
}

// Test connection
async function testConnection() {
  try {
    // Use a timeout for the connection test to avoid hanging
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    console.log("Firebase connection successful");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.error("Firebase connection error: Missing or insufficient permissions. Please check your firestore.rules.");
    } else if (error.message?.includes('the client is offline') || error.code === 'unavailable') {
      console.warn("Firestore is currently unreachable. The app will continue in offline mode.");
    } else {
      console.error("Firebase connection error:", error);
    }
  }
}
testConnection();

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  signInWithPopup,
  signOut
};
