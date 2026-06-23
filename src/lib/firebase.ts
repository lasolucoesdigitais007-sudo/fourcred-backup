import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const filePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  throw new Error('Firebase service account config not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.');
}

let firestoreInstance: admin.firestore.Firestore | null = null;

try {
  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  firestoreInstance = admin.firestore();
} catch (error: any) {
  console.warn('Firebase Admin initialization skipped:', error.message || error);
}

export const firestore = firestoreInstance;
