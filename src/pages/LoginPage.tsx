import { Navigate } from 'react-router-dom';
import BeSpokeLogo from '../components/BeSpokeLogo';
import Footer from '../components/Footer';
import LoginForm from '../features/auth/LoginForm';
import { useUserStore } from '../stores/userStore';

const LoginPage = () => {
  const { user } = useUserStore();

  if (user) {
    return <Navigate to="/introduction" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center space-y-8">
          <BeSpokeLogo />
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
