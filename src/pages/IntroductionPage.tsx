import { Link } from "react-router-dom";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";

const IntroductionPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md">
          <div className="pt-6 pb-4 text-center">
            <BeSpokeLogo />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-6 mb-2 px-4">
              A patient decision aid for prostate cancer treatment options
            </h1>
          </div>
          <hr className="w-full" />
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              The BeSpoke Decision Support tool
            </h2>
            <div className="text-gray-600 mb-8 space-y-4 text-lg leading-relaxed">
              <p>
                We know it can be difficult to choose a treatment for prostate
                cancer. We want to help you understand the options that you have
                available.
              </p>
              <p>
                This tool provides information about how each treatment is carried
                out, how well it deals with the cancer and how it can affect your
                life.
              </p>
              <p>
                The cancer details, and your current health can affect this, so we
                will ask questions about how you are now to help you understand
                how different treatments might affect you.
              </p>
              <p>
                We will also ask what is most important to you when considering
                the different treatments.
              </p>
            </div>
            <div className="flex justify-end">
              <Link to="/patient-info">
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

export default IntroductionPage;
