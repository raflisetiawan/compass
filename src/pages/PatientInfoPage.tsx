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
              <p>
                You have received a new diagnosis of localised prostate cancer,
                which means that the cancer is confined to the prostate.
              </p>
              <p>
                You have been asked to decide how your prostate cancer should be
                managed and if you opt for treatment, which treatment you would
                like to have.
              </p>
              <p>
                The options available to you will depend on your cancer
                characteristics and your overall health. The options may include
                active surveillance, focal therapy, surgery or radiotherapy. Your
                clinical team will be able to tell you which treatment options are
                available to you.
              </p>
            </div>

            <div className="space-y-4">
              <p className="font-semibold text-gray-800 text-lg">
                This tool has three sections:
              </p>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">
                  1. What are the treatment options for localised prostate cancer?
                </h3>
                <p className="text-gray-700 pl-4">
                  In this section, you will find a description of four modern
                  treatment options available for localised prostate cancer in the
                  UK. You will be able to see:
                </p>
                <ul className="list-disc pl-8 space-y-1 text-gray-700">
                  <li>what each treatment is</li>
                  <li>where and how treatment options are delivered</li>
                  <li>what to expect after treatment</li>
                  <li>
                    what follow up would involve, including the type of tests and
                    how often they are needed
                  </li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">
                  2. How will each treatment option impact my life?
                </h3>
                <p className="text-gray-700 pl-4">
                  We will ask questions about your health and your prostate cancer
                  so that we can help you understand how effective treatment might
                  be for you. We know that some people need more than one prostate
                  cancer treatment. Reassuringly, we know that most men with
                  localised prostate cancer will die of something else.
                </p>
                <p className="text-gray-700 pl-4">
                  We know that different prostate cancer treatments can have
                  different side effects such as urinary problems, bowel problems,
                  and difficulty having erections. By asking questions about how
                  things are now, we can help predict how likely these problems are
                  for you, across the different treatment options.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">
                  3. What factors should I consider in my choice?
                </h3>
                <p className="text-gray-700 pl-4">
                  This section will help you reflect on what matters most to you.
                  This can help you choose the treatment option that is best for
                  you. To help you in this process, you will be asked to answer
                  some specific questions about the different aspects of the
                  treatments and how important they are to you.
                </p>
              </div>
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
