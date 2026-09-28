import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import configData from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  projectId: configData.projectId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
  appId: configData.appId,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Specify the provisioned database ID
const db: Firestore = getFirestore(app, configData.firestoreDatabaseId || undefined);
const auth: Auth = getAuth(app);

// Authenticate anonymously in the background so Firestore rules with auth work seamlessly
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth note (app will still function):', err?.message);
});

export { app, db, auth };
