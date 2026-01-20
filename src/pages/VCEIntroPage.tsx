import { Link } from "react-router-dom";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";

const VCEIntroPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="grow flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
          <div className="pt-6 pb-4 text-center">
            <BeSpokeLogo />
          </div>
          <hr className="w-full" />
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">
              What is most important to me?
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Now we are going to ask you to consider a series of statements.
                These statements represent a variety of aspects of different
                prostate cancer treatments.
              </p>
              <p className="leading-relaxed">
                This is an exercise that is meant to help you reflect on what is
                important to you. There is no right or wrong answer.
              </p>
              <p className="leading-relaxed">
                You might like to share your answers with your clinicians so
                that they can help you choose a treatment that best matches your
                preferences.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Link to="/vce/questions">
                <button className="px-8 py-2 text-sm font-semibold text-black bg-[#C2E2E9] border border-transparent rounded-lg hover:bg-[#a8d4de] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">
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

export default VCEIntroPage;
