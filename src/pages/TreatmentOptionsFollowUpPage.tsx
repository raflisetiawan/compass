import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const TreatmentOptionsFollowUpPage = () => {
  const navigate = useNavigate();

  const treatments = [
    {
      name: "ACTIVE SURVEILLANCE",
      headerColor: "bg-blue-50/50",
      schedule: [
        "Regular PSA (every 3-6 months)",
        "MRI (every 1-3 years)",
        "Biopsy (as needed)"
      ],
      investigations: "If PSA and/or MRI progression, biopsy will be repeated",
      furtherTreatment: "All treatment options, according to up-to-date disease evaluation"
    },
    {
      name: "FOCAL THERAPY",
      headerColor: "bg-blue-50/50",
      schedule: [
        "Regular PSA (every 3-6 months)",
        "MRI (every 1-3 years)",
        "Biopsy (as needed)"
      ],
      investigations: "If PSA and/or MRI progression, biopsy will be repeated",
      furtherTreatment: [
        "Repeat focal therapy;",
        "Radiotherapy;",
        "Surgery (possibly more difficult);",
        "Hormones"
      ]
    },
    {
      name: "SURGERY",
      headerColor: "bg-green-50/50",
      schedule: "PSA every 3-6 months",
      investigations: "If PSA >0.1ng/mL, PSMA-ET will performed",
      furtherTreatment: [
        "Radiotherapy",
        "Hormones"
      ]
    },
    {
      name: "RADIOTHERAPY",
      headerColor: "bg-blue-100/50",
      schedule: "PSA every 3-6 months",
      investigations: "If PSA rises above clinician’s determined threshold, PSMA-ET will performed",
      furtherTreatment: [
        "Surgery (rarely an option)",
        "Radiotherapy (rarely an option)",
        "Hormones"
      ]
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
                    INFORMATION ON TREATMENTS FOR LOCALISED PROSTATE CANCER
                  </p>
                  <h2 className="text-xl text-gray-700 font-medium">
                    What does the follow-up involve?
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
                          <h4 className="font-semibold text-gray-900 mb-1">Exam Schedule</h4>
                          <div className="text-gray-900 text-base space-y-1">
                            {Array.isArray(treatment.schedule) ? (
                              treatment.schedule.map((line, i) => <p key={i}>{line}</p>)
                            ) : (
                              <p>{treatment.schedule}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Further investigations</h4>
                          <p className="text-gray-900 text-base">{treatment.investigations}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Further treatment available</h4>
                          <div className="text-gray-900 text-base space-y-1">
                            {Array.isArray(treatment.furtherTreatment) ? (
                              treatment.furtherTreatment.map((line, i) => <p key={i}>{line}</p>)
                            ) : (
                              <p>{treatment.furtherTreatment}</p>
                            )}
                          </div>
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
                        <th className="px-6 py-4 border-b border-gray-200 w-1/4">Exam Schedule</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/4">Further investigations</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/3">Further treatment available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {treatments.map((treatment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className={`px-6 py-4 font-bold text-gray-900 ${treatment.headerColor}`}>
                            {treatment.name}
                          </td>
                          <td className="px-6 py-4 text-gray-900 space-y-1">
                            {Array.isArray(treatment.schedule) ? (
                              treatment.schedule.map((line, i) => <p key={i}>{line}</p>)
                            ) : (
                              treatment.schedule
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {treatment.investigations}
                          </td>
                          <td className="px-6 py-4 text-gray-900 space-y-1">
                            {Array.isArray(treatment.furtherTreatment) ? (
                              treatment.furtherTreatment.map((line, i) => <p key={i}>{line}</p>)
                            ) : (
                              treatment.furtherTreatment
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={() => navigate("/questionnaire")}
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

export default TreatmentOptionsFollowUpPage;
