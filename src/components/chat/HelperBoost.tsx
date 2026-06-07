
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  BriefcaseIcon,
  ChevronRight,
  CircleEllipsis,
  CodeIcon,
  FileText,
  GraduationCapIcon,
  Laugh,
  Layers,
  MailIcon,
  Sparkles,
  UserRoundSearch,
  UserSearch,
} from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";
import { presetReplies } from "@/lib/config-loader";

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const questions = {
  Me: "Who are you? I want to know more about you.",
  Projects: "What are your projects? What are you working on right now?",
  Skills: "What are your skills? Give me a list of your soft and hard skills.",
  Resume: "Can I see your resume?",
  Contact:
    'How can I reach you? What kind of project would make you say "yes" immediately?',
};

const questionConfig = [
  { key: "Me", color: "#329696", icon: Laugh },
  { key: "Projects", color: "#3E9858", icon: BriefcaseBusiness },
  { key: "Skills", color: "#856ED9", icon: Layers },
  { key: "Resume", color: "#D97856", icon: FileText },
  { key: "Contact", color: "#C19433", icon: UserRoundSearch },
];

// Helper drawer data
const specialQuestions = [
  "Who are you?",
  "Can I see your resume?",
  "What projects are you most proud of?",
  "What are your skills?",
  "How can I reach you?",
];

const questionsByCategory = [
  {
    id: "me",
    name: "Me",
    icon: UserSearch,
    questions: [
      "Who are you?",
      "What are your passions?",
      "How did you get started in tech?",
      "Where do you see yourself in 5 years?",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    icon: BriefcaseIcon,
    questions: [
      "Can I see your resume?",
      "What makes you a valuable team member?",
      "Where are you working now?",
      "Why should I hire you?",
      "What's your educational background?",
    ],
  },
  {
    id: "projects",
    name: "Projects",
    icon: CodeIcon,
    questions: [
      "What projects are you most proud of?",
      "What are you working on right now?",
      "How do you evaluate the success of a project once it's completed?",
      "What challenges have you faced in your projects?",
    ],
  },
  {
    id: "skills",
    name: "Skills",
    icon: GraduationCapIcon,
    questions: [
      "What are your skills?",
      "How was your experience working as Research Consultant?",
      "Tell me about your research at Yale University.",
    ],
  },
  {
    id: "contact",
    name: "Contact & Future",
    icon: MailIcon,
    questions: [
      "How can I reach you?",
      "What kind of project would make you say 'yes' immediately?",
      "Where are you located?",
    ],
  },
];

export default function HelperBoost({
  submitQuery,
  handlePresetReply,
}: HelperBoostProps) {
  const [open, setOpen] = useState(false);

  const handleQuestionClick = (questionKey: string) => {
    const question = questions[questionKey as keyof typeof questions];

    // Map question keys to preset replies that match our config exactly
    const presetMapping: { [key: string]: string } = {
      Me: "Who are you?",
      Projects: "What projects are you most proud of?",
      Skills: "What are your skills?",
      Resume: "Can I see your resume?",
      Contact: "How can I reach you?",
    };

    const presetKey = presetMapping[questionKey];
    if (presetKey && presetReplies[presetKey] && handlePresetReply) {
      const preset = presetReplies[presetKey];
      handlePresetReply(presetKey, preset.reply, preset.tool);
    } else if (submitQuery) {
      submitQuery(question);
    }
  };

  const handleDrawerQuestionClick = (question: string) => {
    if (submitQuery) {
      submitQuery(question);
    }
    setOpen(false);
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <div className="custom-scrollbar flex w-full min-w-0 items-center gap-2 overflow-x-auto pb-1">
          {questionConfig.map(({ key, color, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleQuestionClick(key)}
              className="glass-chip glass-hover shine flex h-auto flex-shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 active:scale-[0.98]"
            >
              <Icon size={15} strokeWidth={2} color={color} />
              <span className="text-safe-wrap text-left font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
                {key}
              </span>
            </button>
          ))}

          <Drawer.Trigger className="group relative flex flex-shrink-0 items-center justify-center">
            <motion.div
              className="glass-chip glass-hover shine flex h-auto cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-xs text-slate-500 dark:text-slate-300"
              whileTap={{ scale: 0.98 }}
            >
              <CircleEllipsis className="h-[15px] w-[15px]" strokeWidth={2} />
              <span className="font-mono text-xs font-medium">more</span>
            </motion.div>
          </Drawer.Trigger>
        </div>

        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-100 bg-slate-900/40 backdrop-blur-lg" />
          <Drawer.Content className="fixed right-0 bottom-0 left-0 z-100 mt-24 flex h-[84%] flex-col rounded-t-[28px] border border-slate-200 bg-slate-50 outline-none lg:h-[68%] dark:border-white/10 dark:bg-slate-900">
            <div className="flex-1 overflow-y-auto rounded-t-[28px] p-4 sm:p-6">
              <div className="mx-auto max-w-md space-y-4">
                <div
                  aria-hidden
                  className="mx-auto mb-6 h-1.5 w-14 flex-shrink-0 rounded-full bg-[#1a2535]"
                />
                <div className="mx-auto w-full max-w-md">
                  <p className="section-kicker">Question Library</p>
                  <h3 className="font-display text-safe-balance mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Browse the deeper prompt set.
                  </h3>
                  <div className="space-y-8 pb-16">
                    {questionsByCategory.map((category) => (
                      <CategorySection
                        key={category.id}
                        name={category.name}
                        Icon={category.icon}
                        questions={category.questions}
                        onQuestionClick={handleDrawerQuestionClick}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

// Component for each category section
interface CategorySectionProps {
  name: string;
  Icon: React.ElementType;
  questions: string[];
  onQuestionClick: (question: string) => void;
}

function CategorySection({
  name,
  Icon,
  questions,
  onQuestionClick,
}: CategorySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <Icon className="h-5 w-5 text-indigo-600" />
        <Drawer.Title className="font-display text-[22px] font-medium text-slate-900 dark:text-white">
          {name}
        </Drawer.Title>
      </div>

      <Separator className="my-4 bg-slate-200 dark:bg-white/10" />

      <div className="space-y-3">
        {questions.map((question) => (
          <QuestionItem
            key={question}
            question={question}
            onClick={() => onQuestionClick(question)}
            isSpecial={specialQuestions.includes(question)}
          />
        ))}
      </div>
    </div>
  );
}

// Component for each question item with animated chevron
interface QuestionItemProps {
  question: string;
  onClick: () => void;
  isSpecial: boolean;
}

function QuestionItem({ question, onClick, isSpecial }: QuestionItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        "flex w-full min-w-0 items-center justify-between rounded-[20px] border px-6 py-4 text-left",
        "text-md font-normal",
        "transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b544b]",
        isSpecial
          ? "border-transparent bg-indigo-600 text-white hover:bg-indigo-700"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      )}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex min-w-0 items-center">
        {isSpecial && <Sparkles className="mr-2 h-4 w-4 text-white" />}
        <span
          className={cn(
            "text-safe-wrap",
            isSpecial ? "font-medium text-white" : "font-medium",
          )}
        >
          {question}
        </span>
      </div>
      <motion.div
        animate={{ x: isHovered ? 4 : 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        <ChevronRight
          className={cn(
            "h-5 w-5 shrink-0",
            isSpecial ? "text-white" : "text-indigo-600",
          )}
        />
      </motion.div>
    </motion.button>
  );
}
