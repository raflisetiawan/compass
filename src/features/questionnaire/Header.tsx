import { User, LogOut } from 'lucide-react';
import BeSpokeLogo from '@/components/BeSpokeLogo';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';

const Header = () => {
  const { clearUser } = useUserStore();

  const handleLogout = () => {
    clearUser();
    // In a real app, you'd also call Firebase signout and redirect.
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <BeSpokeLogo />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">12345</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
