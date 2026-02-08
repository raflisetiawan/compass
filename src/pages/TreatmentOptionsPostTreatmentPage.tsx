import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const TreatmentOptionsPostTreatmentPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Post-Treatment | BeSpoke";
  }, []);

  const treatments = [
    {
      name: "ACTIVE SURVEILLANCE",
      headerColor: "bg-blue-50/50",
      management: "None",
      activities: "Immediate (no need to interrupt activities)",
      complications: "None"
    },
    {
      name: "FOCAL THERAPY",
      headerColor: "bg-blue-50/50",
      management: [
        "Urinary catheter for 5-7 days.",
        "Medication: Laxatives, mild pain-killers and antibiotics for 1 week"
      ],
      activities: "Rest for 2 days; moderate discomfort for 1-2 weeks with returning to full activities in 1-3 weeks",
      complications: "Acute urinary retention; Infection; Urethral stricture; Rectal fistula (rare)"
    },
    {
      name: "SURGERY",
      headerColor: "bg-green-50/50",
      management: [
        "Urinary catheter for 7-14 days.",
        "Medication: Pain killers, anti-thrombotic medication, pelvic floor physiotherapy"
      ],
      activities: "Mild-to-moderate pain for 1 week requiring rest for 1 week. Full return after 4 weeks",
      complications: "Acute urinary retention; infection; Bladder neck stricture; Damage to surrounding organs; rectal fistula (rare)"
    },
    {
      name: "RADIOTHERAPY",
      headerColor: "bg-blue-100/50",
      management: "Medication: laxatives, anti-spasmodics for bladder, pain-killers",
      activities: "Daily activities disrupted by daily hospital attendance. Usually mild-to-no discomfort at the beginning, progressively increasing towards the end of treatment.",
      complications: "TBD"
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
                    What to expect after treatment?
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
                          <h4 className="font-semibold text-gray-900 mb-1">Post-Treatment Management</h4>
                          <div className="text-gray-900 text-base space-y-2">
                            {Array.isArray(treatment.management) ? (
                              treatment.management.map((line, i) => <p key={i}>{line}</p>)
                            ) : (
                              <p>{treatment.management}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Return to everyday activities</h4>
                          <p className="text-gray-900 text-base">{treatment.activities}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Possible complications</h4>
                          <p className={`text-gray-900 text-base ${treatment.complications === "TBD" ? "bg-yellow-100 inline-block px-1" : ""}`}>
                            {treatment.complications}
                          </p>
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
                        <th className="px-6 py-4 border-b border-gray-200 w-1/3">Post-Treatment Management</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/4">Return to everyday activities</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/4">Possible complications</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {treatments.map((treatment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className={`px-6 py-4 font-bold text-gray-900 ${treatment.headerColor}`}>
                            {treatment.name}
                          </td>
                          <td className="px-6 py-4 text-gray-900 space-y-2">
                            {Array.isArray(treatment.management) ? (
                              treatment.management.map((line, i) => <p key={i}>{line}</p>)
                            ) : (
                              treatment.management
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {treatment.activities}
                          </td>
                          <td className={`px-6 py-4 text-gray-900 ${treatment.complications === "TBD" ? "bg-yellow-100" : ""}`}>
                            {treatment.complications}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={() => navigate("/treatment-options/follow-up")}
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

export default TreatmentOptionsPostTreatmentPage;
