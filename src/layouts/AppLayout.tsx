import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from '@/features/questionnaire/Header';
import Footer from '@/components/Footer';
import NavigationSidebar from '@/components/NavigationSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const contentAnimations = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Routes where the navigation sidebar should NOT be shown
const ROUTES_WITHOUT_SIDEBAR = ['/login', '/select-patient'];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const showSidebar = !ROUTES_WITHOUT_SIDEBAR.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        {showSidebar && <NavigationSidebar />}
        <motion.main
          key={location.pathname}
          className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto"
          variants={contentAnimations}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
