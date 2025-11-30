import { Link } from "react-router-dom";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";

const PatientInfoPage = () => {
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
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You have received a new diagnosis of localised prostate cancer,
                  which means that the cancer is confined to the prostate.
                </li>
                <li>
                  You have been asked to decide how your prostate cancer should be
                  managed and if you opt for treatment, which treatment you would
                  like to have.
                </li>
                <li>
                  The options available to you will depend on your cancer
                  characteristics and your overall health.
                </li>
                <li>
                  The options may include active surveillance, focal therapy,
                  surgery or radiotherapy.
                </li>
                <li>
                  Your clinical team will be able to tell you which treatment
                  options are available to you.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-gray-800">
                This tool consists of three sections:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                <li>
                  What are the treatment options for localised prostate cancer?
                </li>
                <li>How will each treatment option impact my life?</li>
                <li>What factors should I consider in my choice?</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-700">
                <strong>Disclaimer:</strong> This tool is meant for patients who
                have received a new diagnosis of localised prostate cancer. This
                means that the cancer is confined to the prostate. The tool is
                not intended for men with cancer spreading beyond the prostate
                (i.e. to the lymph nodes or bones), as the information provided
                may not be accurate in this context.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Link to="/questionnaire">
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

export default PatientInfoPage;
