import { initializeApp } from 'firebase/app';

import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
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

export const updateUserLastLogin = async (accessCode: string) => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, accessCode);
    await updateDoc(userDocRef, { lastLoginAt: Timestamp.now() });
  } catch (error) {
    console.error("Error updating user last login: ", error);
  }
};


// --- Questionnaire Session Management ---

const SESSIONS_COLLECTION = 'questionnaireSessions';

import { type ClinicalOutcomes } from '@/types/questionnaire';

export type Answers = { [questionId: string]: string | number };

export interface QuestionnaireSession {
  id?: string; // The document ID of the session
  answers: Answers;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  userAgent: string;
  clinicalOutcomes?: ClinicalOutcomes;
}

/**
 * Loads the most recent questionnaire session for a given user access code.
 * @param accessCode The user's access code.
 * @returns The latest session data including its ID, or null if none exists.
 */
export const loadLatestQuestionnaireSession = async (
  accessCode: string
): Promise<QuestionnaireSession | null> => {
  if (!accessCode) return null;

  try {
    const sessionsRef = collection(
      db,
      SESSIONS_COLLECTION,
      accessCode,
      'sessions'
    );
    const q = query(sessionsRef, orderBy("updatedAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const latestDoc = querySnapshot.docs[0];
    return {
      id: latestDoc.id,
      ...(latestDoc.data() as Omit<QuestionnaireSession, 'id'>),
    };
  } catch (error) {
    console.error("Error loading latest questionnaire session: ", error);
    return null;
  }
};

/**
 * Creates a new questionnaire session for a user.
 * @param accessCode The user's access code.
 * @param initialData The initial data for the new session.
 * @returns The ID of the newly created session document.
 */
export const createNewQuestionnaireSession = async (
  accessCode: string,
  initialData: Omit<QuestionnaireSession, 'id'>
): Promise<string | null> => {
  if (!accessCode) return null;
  try {
    const sessionsRef = collection(
      db,
      SESSIONS_COLLECTION,
      accessCode,
      'sessions'
    );
    const newDocRef = await addDoc(sessionsRef, initialData);
    return newDocRef.id;
  } catch (error) {
    console.error("Error creating new questionnaire session: ", error);
    return null;
  }
};

/**
 * Updates an existing questionnaire session.
 * @param accessCode The user's access code.
 * @param sessionId The ID of the session document to update.
 * @param sessionData The data to update.
 */
export const updateQuestionnaireSession = async (
  accessCode: string,
  sessionId: string,
  sessionData: Partial<Omit<QuestionnaireSession, 'id'>>
) => {
  if (!accessCode || !sessionId) return;

  try {
    const sessionDocRef = doc(
      db,
      SESSIONS_COLLECTION,
      accessCode,
      'sessions',
      sessionId
    );
    await setDoc(sessionDocRef, sessionData, { merge: true });
  } catch (error) {
    console.error("Error updating questionnaire session: ", error);
  }
};
