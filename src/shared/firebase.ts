import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseState: { app?: FirebaseApp } = {};

function getFirebaseApp(): FirebaseApp {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error(
      'Firebase is not configured. Add the VITE_FIREBASE_* values to your .env.local file.',
    );
  }
  firebaseState.app ??= initializeApp(firebaseConfig);
  return firebaseState.app;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getAuth(getFirebaseApp()), email, password);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    getAuth(getFirebaseApp()),
    email,
    password,
  );
  await updateProfile(credential.user, { displayName: username });
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(getAuth(getFirebaseApp()), provider);
  return credential.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(getAuth(getFirebaseApp()));
}
