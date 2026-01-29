import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { useQuestionnaireStore, OPTIONAL_SECTIONS } from "@/stores/questionnaireStore"
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";

const MobileSectionSelector = () => {
  const { sections, answers, currentSectionIndex, goToSection } = useQuestionnaireStore();

  const isSectionUnlocked = (sectionIndex: number) => {
    if (sectionIndex === 0) return true;
    for (let i = 0; i < sectionIndex; i++) {
      const prevSection = sections[i];
      const prevIsOptional = OPTIONAL_SECTIONS.includes(prevSection.section);
      const prevQuestionsAnswered = prevSection.questions.filter((q) => answers[q.id] !== undefined).length;
      // Optional sections don't block the next section
      if (prevQuestionsAnswered !== prevSection.questions.length && !prevIsOptional) {
        return false;
      }
    }
    return true;
  };

  return (
    <Card>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="sections">
          <AccordionTrigger className="p-4 text-lg font-semibold">
            {sections[currentSectionIndex]?.section || 'Loading...'}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1 p-2">
              {sections.map((section, index) => {
                const isUnlocked = isSectionUnlocked(index);
                const isCompleted = section.questions.every((q) => answers[q.id] !== undefined);

                return (
                  <button
                    key={section.section}
                    onClick={() => isUnlocked && goToSection(index)}
                    disabled={!isUnlocked}
                    className={cn(
                      "w-full text-left p-3 rounded-md transition-colors flex items-center justify-between",
                      index === currentSectionIndex ? "bg-blue-50 font-bold" : "hover:bg-gray-50",
                      !isUnlocked && "cursor-not-allowed text-gray-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{section.section}</span>
                      {OPTIONAL_SECTIONS.includes(section.section) && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                    {isUnlocked ? 
                      (isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />) : 
                      <Lock className="h-5 w-5 text-gray-400" />
                    }
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

export default MobileSectionSelector
