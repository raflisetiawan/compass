import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const TreatmentOptionsDeliveryPage = () => {
  const navigate = useNavigate();

  const treatments = [
    {
      name: "ACTIVE SURVEILLANCE",
      headerColor: "bg-blue-50/50",
      location: "Usually managed by your local urology team",
      delivery: "No immediate treatment (close monitoring with PSA, MRI and biopsy, if needed).",
      sessions: "None",
      anaesthesia: "Not required"
    },
    {
      name: "FOCAL THERAPY",
      headerColor: "bg-blue-50/50",
      location: "May require referral to specialised NHS centre offering focal therapy",
      delivery: "Multiple energy available using ultrasounds delivered from rectum (i.e. HIFU = High-Intensity Focused Ultrasound) OR needles through the perineum (i.e. Cryotherapy; IRE = Irreversible electroporation)",
      sessions: "One (Day-surgery)",
      anaesthesia: "General anaesthesia"
    },
    {
      name: "SURGERY",
      headerColor: "bg-green-50/50",
      location: "Usually performed by the robotic urology team of your hospital or a local affiliated centre",
      delivery: "Most commonly minimally-invasive (key-hole) surgery using robotic assistance.",
      sessions: "One (Overnight hospital stay required)",
      anaesthesia: "General anaesthesia"
    },
    {
      name: "RADIOTHERAPY",
      headerColor: "bg-blue-100/50",
      location: "Usually managed by the clinical oncology team of your hospital or a local affiliated centre",
      delivery: "Delivered by external machine targeting the prostate from multiple angles while patient lies on a table",
      sessions: "Between 5, 20 and 37 sessions: requires daily hospital attendance (Mon to Fri) for 4-8 weeks",
      anaesthesia: "Not required (awake)"
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
                    How is the treatment delivered?
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
                          <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                          <p className="text-gray-900 text-base">{treatment.location}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Delivery</h4>
                          <p className="text-gray-900 text-base">{treatment.delivery}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Number of sessions</h4>
                          <p className="text-gray-900 text-base">{treatment.sessions}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Anaesthesia</h4>
                          <p className="text-gray-900 text-base">{treatment.anaesthesia}</p>
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
                        <th className="px-6 py-4 border-b border-gray-200 w-1/4">Location</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/3">Delivery</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/6">Number of sessions</th>
                        <th className="px-6 py-4 border-b border-gray-200 w-1/6">Anaesthesia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {treatments.map((treatment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className={`px-6 py-4 font-bold text-gray-900 ${treatment.headerColor}`}>
                            {treatment.name}
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {treatment.location}
                          </td>
                          <td className="px-6 py-4">
                            {treatment.delivery}
                          </td>
                          <td className="px-6 py-4">
                            {treatment.sessions}
                          </td>
                          <td className="px-6 py-4">
                            {treatment.anaesthesia}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-6">
                  <Button
                    onClick={() => navigate("/treatment-options/post-treatment")}
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

export default TreatmentOptionsDeliveryPage;
