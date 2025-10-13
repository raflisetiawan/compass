import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  ChevronLeft,
  User,
  MessageSquareQuoteIcon,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/layouts/MainLayout";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";

const ResultsPage = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const { answers } = useQuestionnaireStore();

  const clinicalParameters = {
    Age: `${answers.age || "65"} years`,
    PSA: `${answers.psa || "8"} ng/mL`,
    "Prostate volume": `${answers.prostate_volume || "60"} mL`,
    "Gleason Score": answers.gleason_score || "3+4",
    "T Stage": answers.cancer_stage || "T2",
    "MRI visibility": answers.mri_visibility || "Visible (Score 4-5)",
    "Maximal Cancer Core Length": "8mm", // Not in questionnaire
    "Nerve sparing": answers.nerve_sparing || "Unknown",
    "Hormone treatment": answers.radiotherapy_hormone || "Unknown",
  };

  const baselineGenitoUrinaryBowelFunction = {
    Leakage: answers.urine_leak || "Rarely or never",
    Pad: answers.pad_usage || "No pads",
    "Bother with urinary function": answers.urine_problem || "Not a problem",
    "Erectile function":
      answers.erection_quality || "Sufficient erections for intercourse",
    "Sexual Medication or devices": answers.sex_medication || "None",
    "Bother with erectile function": answers.erection_bother || "Not a problem",
    "Bother with Bowel function": answers.bowel_bother || "Not a problem",
  };

  const functionalOutcomes = [
    {
      title: "Leak Free",
      description: "% of Men who rarely or never leak",
    },
    {
      title: "Pad Free",
      description: "% of Men who wear no pad",
    },
    {
      title: "Urinary Bother",
      description:
        "% of Men or whom their urinary function is not considered to be a problem",
    },
    {
      title: "Sufficient erections for intercourse",
      description:
        "% of men whose erections are sufficient for intercourse with or without use of medications or sexual devices",
    },
    {
      title: "Sexual bother",
      description:
        "% of men for whom their sexual function is not considered to be a problem",
    },
    {
      title: "Problem with urgency",
      description:
        "% of men for whom their urgency to have a bowel movement is not considered to be a problem",
    },
    {
      title: "Bowel bother",
      description:
        "% of men for whom their bowel function is not considered to be a problem",
    },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow p-4 md:p-8 bg-gray-50">
          {/* Mobile Header */}
          <div className="md:hidden mb-4">
            <h1 className="text-2xl font-bold mb-4">Results</h1>
            <div className="flex items-center gap-2">
              <Select defaultValue="parameter">
                <SelectTrigger>
                  <SelectValue placeholder="Parameter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parameter">Parameter</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="baseline">
                <SelectTrigger>
                  <SelectValue placeholder="Baseline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">Baseline</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">Results</h1>
            <div className="flex gap-4">
              <Button variant="outline">START OVER</Button>
              <Button variant="default">DOWNLOAD</Button>
            </div>
          </div>

          <div className="flex md:gap-8">
            {isSidebarVisible && (
              <aside className="w-1/3 hidden md:block">
                <div className="flex justify-end mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarVisible(false)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    HIDE
                  </Button>
                </div>
                <Accordion
                  type="multiple"
                  defaultValue={["clinical-params", "baseline-function"]}
                  className="w-full"
                >
                  <AccordionItem value="clinical-params">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-3">
                        <User className="h-6 w-6" />
                        Clinical Parameters
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <div className="divide-y">
                        {Object.entries(clinicalParameters).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="p-4 flex justify-between items-center"
                            >
                              <p className="text-sm text-gray-500">{key}</p>
                              <p className="font-bold">{value}</p>
                            </div>
                          )
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="baseline-function">
                    <AccordionTrigger className="text-lg font-semibold">
                      <div className="flex items-center gap-3">
                        <MessageSquareQuoteIcon className="h-6 w-6" />
                        Baseline genito-urinary-bowel function
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0">
                      <div className="divide-y">
                        {Object.entries(baselineGenitoUrinaryBowelFunction).map(
                          ([key, value]) => (
                            <div key={key} className="p-4">
                              <p className="text-sm text-gray-500">
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (str) => str.toUpperCase())}
                              </p>
                              <p className="font-bold">{value}</p>
                            </div>
                          )
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </aside>
            )}

            <div className={isSidebarVisible ? "w-full md:w-2/3" : "w-full"}>
              <Card>
                <CardHeader className="text-center p-4">
                  <CardTitle className="text-xl font-bold mt-4">
                    Summary Table of Functional Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {functionalOutcomes.map((item) => (
                      <Card
                        key={item.title}
                        className="shadow-md rounded-lg border"
                      >
                        <CardContent className="p-4">
                          <h4 className="font-bold text-teal-600">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-2">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 bg-blue-100 text-blue-800 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-1 flex-shrink-0" />
                    <p className="text-sm">
                      These definitions correspond to the lowest score (1 out of
                      5) of their corresponding EPIC-26 questions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default ResultsPage;
