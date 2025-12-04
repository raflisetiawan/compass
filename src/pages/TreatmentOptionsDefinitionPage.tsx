import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const TreatmentOptionsDefinitionPage = () => {
  const navigate = useNavigate();

  const treatments = [
    {
      name: "ACTIVE SURVEILLANCE",
      headerColor: "bg-blue-50/50",
      definition: "Monitoring disease with regular tests.",
      details: "This means avoiding treatment while closely monitoring the prostate cancer. This allows prompt identification of disease progression that will then require treatment.",
      goal: "Avoid the side effects associated with treatment. Treatment is postponed (or even avoided).",
      suitability: "Low and some intermediate risk cancers."
    },
    {
      name: "FOCAL THERAPY",
      headerColor: "bg-blue-50/50",
      definition: "Treatment of only the area in the prostate containing cancer.",
      details: "Treatment limited to area of prostate containing cancer and its surrounding margin, while leaving the rest of the prostate untouched.",
      goal: "Limiting the side-effects of treatment by preserving the portion of the prostate that does not contain worrisome cancer.",
      suitability: "Intermediate risk cancer that are visible at imaging and generally localised to one area of the prostate only."
    },
    {
      name: "SURGERY",
      headerColor: "bg-green-50/50",
      definition: "Surgical removal of the entire prostate.",
      details: "Removal of whole prostate and seminal vesicles with surgery (most commonly mini-invasive robotic surgery).",
      goal: "Eradicating the prostate cancer by removing the whole prostate with surgery, without leaving traces behind.",
      suitability: "Most intermediate and high-risk cancers."
    },
    {
      name: "RADIOTHERAPY",
      headerColor: "bg-blue-100/50",
      definition: "Radiation delivered to the entire prostate.",
      details: "Irradiation of the whole prostate delivered by an external machine. May need addition of hormone (anti-testosterone) treatment.",
      goal: "Eradicating the whole prostate cancer by destroying the whole prostate without removing it with surgery (i.e. avoiding invasive procedures).",
      suitability: "Most intermediate and high-risk cancers."
    }
  ];

  return (
    <MainLayout>
      <AnimatedPage>
        <div className="flex-grow flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl space-y-8">
            <Card className="w-full shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center text-lg font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    <ArrowLeft className="mr-3 h-6 w-6" />
                    Back
                  </Button>
                  <BeSpokeLogo />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    What treatments are available for localised prostate cancer?
                  </p>
                  <h2 className="text-xl text-gray-700 font-medium">
                    What is the treatment doing?
                  </h2>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-6">
                  {treatments.map((treatment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className={`px-4 py-3 font-bold text-gray-900 ${treatment.headerColor}`}>
                        {treatment.name}
                      </div>
                      <div className="p-4 space-y-4 bg-white">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Definition</h4>
                          <p className="text-gray-900 text-base">{treatment.definition}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Details</h4>
                          <p className="text-gray-900 text-base">{treatment.details}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Goal</h4>
                          <p className="text-gray-900 text-base">{treatment.goal}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Suitability</h4>
                          <p className="text-gray-900 text-base">{treatment.suitability}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full border-collapse bg-white text-base text-left text-gray-900">
                    <thead className="bg-gray-100 text-gray-900 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/6">Treatment</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/6">Definition</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/3">Details</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/6">Goal</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/6">Suitability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {treatments.map((treatment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className={`px-6 py-4 font-bold text-gray-900 ${treatment.headerColor}`}>
                            {treatment.name}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {treatment.definition}
                          </td>
                          <td className="px-6 py-4">
                            {treatment.details}
                          </td>
                          <td className="px-6 py-4">
                            {treatment.goal}
                          </td>
                          <td className="px-6 py-4">
                            {treatment.suitability}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={() => navigate("/treatment-options/delivery")}
                    className="px-8 py-2 text-sm font-semibold bg-[#e0f2f7] text-gray-700 hover:bg-gray-300 border border-transparent rounded-lg transition-colors"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    </MainLayout>
  );
};

export default TreatmentOptionsDefinitionPage;
