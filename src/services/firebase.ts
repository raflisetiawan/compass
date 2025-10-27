


import { initializeApp } from 'firebase/app';

import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';

import {

  getFirestore,

  doc,

  setDoc,

  getDoc,

  updateDoc,
  Timestamp,

} from 'firebase/firestore';

import { type User } from '@/types';



const firebaseConfig = {

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId: import.meta.env.VITE_FIREBASE_APP_ID,

};



const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence
});

const db = getFirestore(app);



export { auth, db };



// --- User Management ---

const USERS_COLLECTION = 'users';

export const getUserDocByAccessCode = async (accessCode: string): Promise<Partial<User> | null> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, accessCode);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as Partial<User>;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user doc: ", error);
    return null;
  }
};

export const updateUserUid = async (accessCode: string, uid: string) => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, accessCode);
    await updateDoc(userDocRef, { uid });
  } catch (error) {
    console.error("Error updating user UID: ", error);
  }
};


// --- Questionnaire Session Management ---



const SESSIONS_COLLECTION = 'questionnaireSessions';



export type Answers = { [questionId: string]: string | number };



export interface QuestionnaireSession {

  answers: Answers;

  currentSectionIndex: number;

  currentQuestionIndex: number;

  updatedAt: Date | Timestamp;

}



export const saveQuestionnaireSession = async (sessionKey: string, session: Partial<QuestionnaireSession>) => {

  if (!sessionKey) return;

  try {
    const sessionDocRef = doc(db, SESSIONS_COLLECTION, sessionKey);

    await setDoc(sessionDocRef, { ...session, updatedAt: new Date() }, { merge: true });

  } catch (error) {

    console.error("Error saving questionnaire session: ", error);

  }

};



export const loadQuestionnaireSession = async (sessionKey: string): Promise<QuestionnaireSession | null> => {

  if (!sessionKey) return null;

  try {

    const sessionDocRef = doc(db, SESSIONS_COLLECTION, sessionKey);

    const docSnap = await getDoc(sessionDocRef);

    if (docSnap.exists()) {

      const sessionData = docSnap.data() as QuestionnaireSession;

      // Check if session is older than 24 hours

      const now = new Date();
      
      const updatedAt = sessionData.updatedAt as Timestamp;
      const sessionDate = updatedAt.toDate();
      const hoursDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);


      if (hoursDiff > 24) {

        // Session expired, return null

        return null;

      }

      return { ...sessionData, updatedAt: sessionDate };

    }

    return null;

  } catch (error) {

    console.error("Error loading questionnaire session: ", error);

    return null;

  }

};
