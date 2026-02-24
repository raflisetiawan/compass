import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from '@/features/questionnaire/Header';
import Footer from '@/components/Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

const contentAnimations = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <motion.main
        key={location.pathname}
        className="flex-grow p-4 sm:p-6 lg:p-8"
        variants={contentAnimations}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl">{children}</div>
      </motion.main>
      <Footer />
    </div>
  );
};

export default AppLayout;
