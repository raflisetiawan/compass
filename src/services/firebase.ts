
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

// --- New functions ---

const SESSIONS_COLLECTION = 'questionnaireSessions';

export type Answers = { [questionId: string]: string | number };

export interface QuestionnaireSession {
  answers: Answers;
  currentSectionIndex: number;
  currentQuestionIndex: number;
}

export const saveQuestionnaireSession = async (userId: string, session: QuestionnaireSession) => {
  if (!userId) return;
  try {
    const sessionDocRef = doc(db, SESSIONS_COLLECTION, userId);
    await setDoc(sessionDocRef, { ...session, updatedAt: new Date() }, { merge: true });
  } catch (error) {
    console.error("Error saving questionnaire session: ", error);
  }
};

export const loadQuestionnaireSession = async (userId: string): Promise<QuestionnaireSession | null> => {
  if (!userId) return null;
  try {
    const sessionDocRef = doc(db, SESSIONS_COLLECTION, userId);
    const docSnap = await getDoc(sessionDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as QuestionnaireSession;
    }
    return null;
  } catch (error) {
    console.error("Error loading questionnaire session: ", error);
    return null;
  }
};

