
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AnimatePresence } from 'framer-motion';

import LoginPage from './pages/LoginPage';
import IntroductionPage from './pages/IntroductionPage';
import QuestionnairePage from './pages/QuestionnairePage';
import SummaryPage from './pages/SummaryPage';
import ResultsPage from './pages/ResultsPage';
import SelectPatientPage from './pages/SelectPatientPage'; // Import the new page
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedPage from './components/AnimatedPage';
import { auth } from './services/firebase';
import { useUserStore } from './stores/userStore';

function App() {
  const { setUser, logout } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    const sessionStartTime = localStorage.getItem('sessionStartTime');
    if (sessionStartTime) {
      const startTime = parseInt(sessionStartTime, 10);
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - startTime > twentyFourHours) {
        logout();
        return;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // The user object from onAuthStateChanged is the Firebase user.
      // We should not set it directly if our store expects a custom user type.
      // The login logic in useLoginForm now handles setting our custom user object.
      if (!user) {
        // Only clear the store and local storage on logout
        logout();
      }
    });

    return () => unsubscribe();
  }, [setUser, logout]);

  // Set page title based on route
  useEffect(() => {
    let title = 'COMPASS';
    switch (location.pathname) {
      case '/login':
        title = 'Login | COMPASS';
        break;
      case '/select-patient': // Add title for the new page
        title = 'Select Patient | COMPASS';
        break;
      case '/introduction':
        title = 'Introduction | COMPASS';
        break;
      case '/questionnaire':
        title = 'Questionnaire | COMPASS';
        break;
      case '/summary':
        title = 'Summary | COMPASS';
        break;
      case '/results':
        title = 'Results | COMPASS';
        break;
    }
    document.title = title;
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={<AnimatedPage><LoginPage /></AnimatedPage>}
        />
        <Route
          path="/select-patient"
          element={<ProtectedRoute><AnimatedPage><SelectPatientPage /></AnimatedPage></ProtectedRoute>}
        />
        <Route
          path="/introduction"
          element={<ProtectedRoute><AnimatedPage><IntroductionPage /></AnimatedPage></ProtectedRoute>}
        />
        <Route
          path="/questionnaire"
          element={<ProtectedRoute><AnimatedPage><QuestionnairePage /></AnimatedPage></ProtectedRoute>}
        />
        <Route
          path="/summary"
          element={<ProtectedRoute><AnimatedPage><SummaryPage /></AnimatedPage></ProtectedRoute>}
        />
        <Route
          path="/results"
          element={<ProtectedRoute><AnimatedPage><ResultsPage /></AnimatedPage></ProtectedRoute>}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
