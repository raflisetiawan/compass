import { Link } from "react-router-dom";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";

const PersonalisedInfoIntroPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
          <div className="pt-6 pb-4 text-center">
            <BeSpokeLogo />
          </div>
          <hr className="w-full" />
          <div className="p-8 space-y-6">
            <div className="space-y-4 text-gray-700">
              <p className="text-lg leading-relaxed">
                In order to give you personalised information, we need to ask
                you a few questions about yourself first. To help us give you
                the most accurate results, it is important that you answer all
                questions honestly and completely.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Link to="/treatment-options/definition">
                <button className="px-8 py-2 text-sm font-semibold text-gray-700 bg-[#e0f2f7] border border-transparent rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">
                  Next
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalisedInfoIntroPage;
