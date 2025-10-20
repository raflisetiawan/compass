import { Link } from "react-router-dom";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";

const IntroductionPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md">
          <div className="pt-2">
            <BeSpokeLogo />
          </div>
          <hr className="w-full mt-3" />
          <div className="p-8">
            <p className="text-2xl font-bold my-4">Introduction</p>
            <p className="text-gray-600 mb-6">
              This tool is designed to help you understand your prostate cancer
              treatment options. You will be asked a series of questions about
              your health and preferences. Lorem ipsum dolor sit amet
              consectetur adipisicing elit. Nobis doloremque perferendis nisi
              illo aliquid unde reiciendis nulla voluptatem, libero quasi.
            </p>
            <button className="px-8 py-2 text-sm font-semibold text-gray-700 bg-[#e0f2f7] border border-transparent rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors float-right mb-8">
              <Link to="/questionnaire">Next</Link>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IntroductionPage;
