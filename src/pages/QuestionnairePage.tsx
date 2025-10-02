import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/features/questionnaire/Header';
import MobileSectionSelector from '@/features/questionnaire/MobileSectionSelector';
import QuestionCard from '@/features/questionnaire/QuestionCard';
import Sidebar from '@/features/questionnaire/Sidebar';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useUserStore } from '@/stores/userStore';

const QuestionnairePage = () => {
  const { user } = useUserStore();
  const { loadInitialData, isLoading } = useQuestionnaireStore();

  // Fetch initial data only when the user object is available.
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg text-gray-600">Loading your progress...</p>
          </div>
        ) : (
          <>
            {/* Mobile-only Accordion */}
            <div className="block lg:hidden mb-4">
              <MobileSectionSelector />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Desktop-only Sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <Sidebar />
              </div>

              {/* Question Card */}
              <div className="col-span-1 lg:col-span-2">
                <QuestionCard />
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QuestionnairePage;
