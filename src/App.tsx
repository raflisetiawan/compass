
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import LoginPage from './pages/LoginPage';
import IntroductionPage from './pages/IntroductionPage';
import QuestionnairePage from './pages/QuestionnairePage';
import ResultsPage from './pages/ResultsPage';
import SelectPatientPage from './pages/SelectPatientPage'; // Import the new page
import AboutPage from './pages/AboutPage';
import ProtectedRoute from './components/ProtectedRoute';
import AnimatedPage from './components/AnimatedPage';

function App() {
  const location = useLocation();

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
      case '/results':
        title = 'Results | COMPASS';
        break;
      case '/about':
        title = 'About | COMPASS';
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
          path="/results"
          element={<ProtectedRoute><AnimatedPage><ResultsPage /></AnimatedPage></ProtectedRoute>}
        />
        <Route
          path="/about"
          element={<AnimatedPage><AboutPage /></AnimatedPage>}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
