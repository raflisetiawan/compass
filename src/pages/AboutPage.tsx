import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeSpokeLogo from "@/components/BeSpokeLogo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MainLayout from "@/layouts/MainLayout";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <AnimatedPage>
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl space-y-8">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center text-lg font-semibold text-gray-800"
                  >
                    <ArrowLeft className="mr-3 h-6 w-6" />
                    About
                  </Button>
                  <BeSpokeLogo />
                </div>
              </CardHeader>
              <CardContent className="text-gray-700 space-y-6">
                <div className="space-y-4">
                  <p>
                    The choice between different options for localised prostate
                    cancer can be a difficult one. The BeSpoke Decision Support
                    Tool was developed to help people to decide by giving them
                    information specific to them and their cancer.
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Data Sources
                    </h3>
                    <p>
                      We have looked at different data sources to provide you with
                      personalised estimates of what you can expect with modern
                      treatments. The data comes from:
                    </p>
                  </div>
                </div>

                <ul className="space-y-6">
                  <li>
                    <h4 className="font-bold text-gray-900">
                      TrueNTH UK and Global Registries (N= 1032)
                    </h4>
                    <p className="mt-1">
                      Large studies asking men with a new diagnosis of prostate
                      cancer to answer questions on urinary, bowel and sexual
                      function before and after treatment.
                    </p>
                  </li>
                  <li>
                    <h4 className="font-bold text-gray-900">
                      National Prostate Cancer Audit (NPCA) of England and Wales
                      (N= 71309)
                    </h4>
                    <p className="mt-1">
                      Routine healthcare data to provide information about the
                      longer term outcomes of prostate cancer, such as the
                      likelihood of dying of prostate cancer, or another cause,
                      and the likelihood of needing a second treatment after
                      initial surgery or focal therapy.
                    </p>
                  </li>
                  <li>
                    <h4 className="font-bold text-gray-900">
                      PACE B Trial (Prostate Advances in Comparative Evidence)
                    </h4>
                    <p className="mt-1">
                      Trial from the Institute of Cancer Research looking at
                      different types of radiotherapy for the treatment of
                      prostate cancer. Patient outcomes from this trial will
                      provide information about the likelihood of needing
                      subsequent hormone treatment after initial radiotherapy
                      (also known as androgen deprivation therapy).
                    </p>
                  </li>
                  <li>
                    <h4 className="font-bold text-gray-900">
                      UCLH Active Surveillance Cohort (N= 875)
                    </h4>
                    <p className="mt-1">
                      Patient data collected from UCLH for patients undergoing
                      MRI-led Active Surveillance and the likelihood of needing
                      subsequent treatment.
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    </MainLayout>
  );
};

export default AboutPage;
