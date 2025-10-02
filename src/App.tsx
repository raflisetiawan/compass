import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AnimatePresence } from 'framer-motion';

import LoginPage from './pages/LoginPage';
import IntroductionPage from './pages/IntroductionPage';
import QuestionnairePage from './pages/QuestionnairePage';
import SummaryPage from './pages/SummaryPage';
import ResultsPage from './pages/ResultsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedPage from './components/AnimatedPage';
import { auth } from './services/firebase';
import { useUserStore } from './stores/userStore';

function App() {
  const { setUser } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        localStorage.removeItem('userToken');
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={<AnimatedPage><LoginPage /></AnimatedPage>}
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
