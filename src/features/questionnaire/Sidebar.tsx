import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuestionnaireStore, type Section } from '@/stores/questionnaireStore';

type Status = 'COMPLETED' | 'ON GOING' | 'LOCKED';

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: Status;
  isActive?: boolean;
  onClick?: () => void;
  isDisabled?: boolean;
}

const statusStyles: Record<Status, string> = {
  COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-100',
  'ON GOING': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  LOCKED: 'bg-gray-100 text-gray-500 hover:bg-gray-100',
};

const SidebarItem = ({ icon, title, subtitle, status, isActive, onClick, isDisabled }: SidebarItemProps) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={cn(
      'flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors',
      isActive ? 'bg-blue-50' : 'hover:bg-gray-50',
      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
    )}
  >
    <div className={cn('rounded-full p-2', isActive ? 'bg-blue-100' : 'bg-gray-100')}>
      {icon}
    </div>
    <div className="flex-grow">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    <Badge className={cn('font-bold', statusStyles[status])}>{status}</Badge>
  </button>
);

const getIcon = (status: Status, isCurrent: boolean) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    case 'ON GOING':
      return <Clock className="h-6 w-6 text-yellow-600" />;
    case 'LOCKED':
      return <Lock className="h-6 w-6 text-gray-500" />;
    default:
      return <Lock className="h-6 w-6 text-gray-500" />;
  }
};

const Sidebar = () => {
  const { sections, answers, currentSectionIndex, goToSection } = useQuestionnaireStore();

  const getSectionStatus = (section: Section, index: number): { status: Status; isUnlocked: boolean } => {
    const allQuestionsAnswered = section.questions.every((q) => answers[q.id] !== undefined);

    if (allQuestionsAnswered) {
      return { status: 'COMPLETED', isUnlocked: true };
    }

    // Check if all previous sections are complete to determine unlock status.
    let allPreviousComplete = true;
    for (let i = 0; i < index; i++) {
      const prevSection = sections[i];
      const allPrevAnswered = prevSection.questions.every((q) => answers[q.id] !== undefined);
      if (!allPrevAnswered) {
        allPreviousComplete = false;
        break;
      }
    }

    if (allPreviousComplete) {
      // This is the first section that is not complete, so it's ongoing.
      return { status: 'ON GOING', isUnlocked: true };
    } else {
      // A previous section is not yet complete.
      return { status: 'LOCKED', isUnlocked: false };
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          {sections.map((section, index) => {
            const { status, isUnlocked } = getSectionStatus(section, index);
            const questionsAnswered = section.questions.filter((q) => answers[q.id] !== undefined).length;
            const subtitle = status === 'COMPLETED' ? `${section.questions.length}/${section.questions.length} Answers` : `${questionsAnswered}/${section.questions.length} Answers`;

            return (
              <SidebarItem
                key={section.section}
                title={section.section}
                subtitle={subtitle}
                status={status}
                icon={getIcon(status, index === currentSectionIndex)}
                isActive={index === currentSectionIndex}
                isDisabled={!isUnlocked}
                onClick={() => isUnlocked && goToSection(index)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Sidebar;
