import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  BookOpen,
  Stethoscope,
  ClipboardList,
  Heart,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Navigation data structure
interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  label: string;
  icon?: React.ReactNode;
  items?: NavItem[];
  subGroups?: { label: string; items: NavItem[] }[];
}

interface NavEntry {
  type: "item" | "group";
  label: string;
  path?: string;
  icon?: React.ReactNode;
  group?: NavGroup;
}

const NAV_STRUCTURE: NavEntry[] = [
  {
    type: "item",
    label: "Homepage",
    path: "/introduction",
    icon: <Home className="h-5 w-5 flex-shrink-0" />,
  },
  {
    type: "item",
    label: "Who is BeSpoke Decision Support for?",
    path: "/patient-info",
    icon: <BookOpen className="h-5 w-5 flex-shrink-0" />,
  },
  {
    type: "item",
    label: "How do I use BeSpoke Decision Support?",
    path: "/personalised-info-intro",
    icon: <BookOpen className="h-5 w-5 flex-shrink-0" />,
  },
  {
    type: "item",
    label: "List of Medical Terms",
    path: "/about",
    icon: <FileText className="h-5 w-5 flex-shrink-0" />,
  },
  {
    type: "group",
    label: "Information on Treatment Options",
    group: {
      label: "Information on Treatment Options",
      icon: <Stethoscope className="h-5 w-5 flex-shrink-0" />,
      items: [
        {
          label: "What treatments are available for localised prostate cancer?",
          path: "/treatment-options/definition",
        },
        {
          label: "How is each treatment performed?",
          path: "/treatment-options/delivery",
        },
        {
          label: "What to expect after treatment?",
          path: "/treatment-options/post-treatment",
        },
        {
          label: "What does the follow-up involve?",
          path: "/treatment-options/follow-up",
        },
      ],
    },
  },
  {
    type: "group",
    label: "Questions about yourself",
    group: {
      label: "Questions about yourself",
      icon: <ClipboardList className="h-5 w-5 flex-shrink-0" />,
      items: [
        { label: "Clinical characteristics", path: "/questionnaire" },
        { label: "Urinary function", path: "/questionnaire" },
        { label: "Erectile function", path: "/questionnaire" },
        { label: "Bowel function", path: "/questionnaire" },
      ],
    },
  },
  {
    type: "item",
    label: "What is important to me?",
    path: "/vce/intro",
    icon: <Heart className="h-5 w-5 flex-shrink-0" />,
  },
  {
    type: "group",
    label: "How will each treatment option impact my life?",
    group: {
      label: "How will each treatment option impact my life?",
      icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />,
      items: [
        {
          label: "Survival after prostate cancer diagnosis",
          path: "/functional-outcome/survival-after-prostate-cancer-treatment",
        },
        {
          label: "Need for additional treatment",
          path: "/functional-outcome/risk-retreatment-equations",
        },
      ],
      subGroups: [
        {
          label: "Impact on urinary function",
          items: [
            {
              label: "Leaking urine",
              path: "/functional-outcome/leaking-urine-at-one-year",
            },
            {
              label: "Wearing urinary pads",
              path: "/functional-outcome/use-of-urinary-pads-at-one-year",
            },
            {
              label: "Problem with urinary function",
              path: "/functional-outcome/urinary-bother",
            },
          ],
        },
        {
          label: "Impact on sexual function",
          items: [
            {
              label: "Firmness of erections",
              path: "/functional-outcome/sufficient-erections-for-intercourse",
            },
            {
              label: "Problems with sexual function",
              path: "/functional-outcome/sexual-bother",
            },
          ],
        },
        {
          label: "Impact on bowel function",
          items: [
            {
              label: "Problems with bowel urgency",
              path: "/functional-outcome/problem-with-urgency",
            },
            {
              label: "Problems with bowel function",
              path: "/functional-outcome/bowel-bother",
            },
          ],
        },
        {
          label: "Summary tables",
          items: [
            {
              label: "Survival and additional treatment",
              path: "/functional-outcome/final-summary-table",
            },
            {
              label: "Answers from predictions",
              path: "/functional-outcome/vce-results",
            },
          ],
        },
      ],
    },
  },
];

// Reusable nav link component — large touch targets for elderly users
const NavLink = ({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left px-4 py-3 rounded-lg text-base transition-colors min-h-[44px]",
      isActive
        ? "bg-[#C2E2E9] text-gray-900 font-semibold border-l-4 border-[#2a7f8f]"
        : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
    )}
  >
    {item.label}
  </button>
);

// Sub-group component for nested groups like "Impact on urinary function"
const SubGroup = ({
  label,
  items,
  currentPath,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
}) => (
  <div className="ml-1 mt-2">
    <p className="text-sm font-bold text-gray-500 px-4 py-2">
      {label}
    </p>
    <div className="space-y-1">
      {items.map((item, idx) => (
        <NavLink
          key={idx}
          item={item}
          isActive={currentPath === item.path}
          onClick={() => onNavigate(item.path)}
        />
      ))}
    </div>
  </div>
);

// Full navigation content (shared between desktop and mobile)
const NavigationContent = ({
  onNavigate,
  hideHeader = false,
}: {
  onNavigate: (path: string) => void;
  hideHeader?: boolean;
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which accordion groups should be open based on current path
  const getDefaultOpenGroups = () => {
    const openGroups: string[] = [];
    NAV_STRUCTURE.forEach((entry) => {
      if (entry.type === "group" && entry.group) {
        const hasActiveItem = entry.group.items?.some(
          (item) => item.path === currentPath
        );
        const hasActiveSubItem = entry.group.subGroups?.some((sg) =>
          sg.items.some((item) => item.path === currentPath)
        );
        if (hasActiveItem || hasActiveSubItem) {
          openGroups.push(entry.label);
        }
      }
    });
    return openGroups;
  };

  return (
    <div className="flex flex-col h-full">
      {!hideHeader && (
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900">
            Navigation
          </h2>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {NAV_STRUCTURE.map((entry, index) => {
            if (entry.type === "item") {
              return (
                <button
                  key={index}
                  onClick={() => onNavigate(entry.path!)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors min-h-[44px]",
                    currentPath === entry.path
                      ? "bg-[#C2E2E9] text-gray-900 font-semibold border-l-4 border-[#2a7f8f]"
                      : "text-gray-800 hover:bg-gray-100"
                  )}
                >
                  {entry.icon}
                  <span>{entry.label}</span>
                </button>
              );
            }

            if (entry.type === "group" && entry.group) {
              return (
                <Accordion
                  key={index}
                  type="multiple"
                  defaultValue={getDefaultOpenGroups()}
                  className="w-full"
                >
                  <AccordionItem value={entry.label} className="border-none">
                    <AccordionTrigger className="px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100 rounded-lg hover:no-underline [&[data-state=open]]:bg-gray-50 min-h-[44px]">
                      <div className="flex items-center gap-3">
                        {entry.group.icon}
                        <span className="text-left">{entry.group.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-0 pl-5">
                      <div className="space-y-1">
                        {entry.group.items?.map((item, idx) => (
                          <NavLink
                            key={idx}
                            item={item}
                            isActive={currentPath === item.path}
                            onClick={() => onNavigate(item.path)}
                          />
                        ))}
                        {entry.group.subGroups?.map((sg, sgIdx) => (
                          <SubGroup
                            key={sgIdx}
                            label={sg.label}
                            items={sg.items}
                            currentPath={currentPath}
                            onNavigate={onNavigate}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              );
            }

            return null;
          })}
        </div>
      </nav>
    </div>
  );
};

// Main NavigationSidebar component
const NavigationSidebar = () => {
  // Expanded by default for elderly users — easier to discover navigation
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0",
          isExpanded ? "w-80" : "w-14"
        )}
      >
        {/* Toggle button — large and clear */}
        <div className="flex justify-center py-3 border-b border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 text-sm font-medium min-h-[40px]"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Hide menu</span>
              </>
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && <NavigationContent onNavigate={handleNavigate} />}

        {/* Collapsed icons */}
        {!isExpanded && (
          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Show navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile FAB (floating action button) — large touch target */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 p-4 bg-[#C2E2E9] text-gray-800 rounded-full shadow-lg hover:bg-[#a8d4de] transition-colors min-h-[56px] min-w-[56px] flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-80 max-w-[85vw] bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">
                Navigation
              </h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavigationContent onNavigate={handleNavigate} hideHeader />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationSidebar;
