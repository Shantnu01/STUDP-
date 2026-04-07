// src/lib/firebase.js
import admin from 'firebase-admin';

let app;

export function initFirebase() {
  if (admin.apps.length > 0) return admin.apps[0];

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key from .env has literal \n — convert them back to newlines
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log('✅ Firebase Admin SDK initialized');
  return app;
}

export const getDb      = () => admin.firestore();
export const getAuth    = () => admin.auth();
export const getStorage = () => admin.storage();
