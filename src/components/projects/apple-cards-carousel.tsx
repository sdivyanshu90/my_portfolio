"use client";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ProjectCover from "@/components/projects/project-cover";

// Simple icon components to replace @tabler/icons-react
const IconArrowNarrowLeft = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M5 12l6 6" />
    <path d="M5 12l6-6" />
  </svg>
);

const IconArrowNarrowRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M13 18l6-6" />
    <path d="M13 6l6 6" />
  </svg>
);

const IconX = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

type Card = {
  title: string;
  category: string;
  summary: string;
  project: Project;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({
  items,
  initialScroll = 0,
}: {
  items: React.ReactNode[];
  initialScroll?: number;
}) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Get the card width and gap based on viewport size
  const getScrollDistance = () => {
    const cardWidth = window.innerWidth < 640 ? 300 : 360;
    const gap = 20;
    const totalWidth = cardWidth + gap;

    return totalWidth;
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -getScrollDistance(),
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: getScrollDistance(),
        behavior: "smooth",
      });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 300 : 360;
      const gap = 20;
      const scrollPosition = (cardWidth + gap) * index;
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return typeof window !== "undefined" && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-8 [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "pointer-events-none absolute right-0 z-[10] h-full w-16 overflow-hidden bg-gradient-to-l from-[#f6f0e8] to-transparent",
            )}
          />

          <div
            className={cn(
              "mx-auto flex flex-row justify-start gap-5 px-1 sm:px-2",
              "max-w-7xl",
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                viewport={{ once: true }}
                key={"card" + index}
                className="rounded-[32px] last:pr-[10%] md:last:pr-[28%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-4 flex justify-end gap-2 md:mr-10">
          <button
            className="relative z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e1e9] bg-white/85 text-[#102133] shadow-sm transition hover:-translate-y-0.5 disabled:opacity-40"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-5 w-5" />
          </button>
          <button
            className="relative z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#d8e1e9] bg-white/85 text-[#102133] shadow-sm transition hover:-translate-y-0.5 disabled:opacity-40"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleClose = useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [index, onCardClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, open]);

  useOutsideClick(containerRef, handleClose);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-52 overflow-auto px-4 py-6 sm:px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-[#081018]/78 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto h-fit max-w-6xl rounded-[36px] border border-white/30 bg-[#f6f0e8] font-sans shadow-[0_40px_120px_rgba(8,16,24,0.35)]"
            >
              <div className="sticky top-4 z-52 flex justify-end px-5 pt-5 sm:px-8 lg:px-10 lg:pt-8">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#102133] shadow-md"
                  onClick={handleClose}
                >
                  <IconX className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="grid min-w-0 gap-8 px-5 pb-8 sm:px-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:px-10 lg:pb-10">
                <div className="min-w-0 space-y-6 xl:sticky xl:top-12 xl:self-start">
                  <ProjectCover project={card.project} />
                  <div className="panel-surface px-6 py-6">
                    <p className="section-kicker">Case Study Preview</p>
                    <p className="text-safe-wrap mt-4 text-sm leading-7 text-[#425062]">
                      {card.summary}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 space-y-6 pb-2">
                  <motion.p
                    layoutId={layout ? `category-${card.title}` : undefined}
                    className="section-kicker"
                  >
                    {card.category}
                  </motion.p>
                  <motion.p
                    layoutId={layout ? `title-${card.title}` : undefined}
                    className="font-display text-safe-balance text-3xl font-semibold tracking-tight text-[#102133] sm:text-4xl lg:text-5xl"
                  >
                    {card.title}
                  </motion.p>
                  <div className="soft-rule" />
                  <div>{card.content}</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        whileHover={{ y: -6 }}
        className="group relative z-10 flex h-[470px] w-[300px] min-w-0 flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-3 text-left shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:h-[520px] sm:w-[360px]"
      >
        <div className="h-[248px] overflow-hidden rounded-[26px] sm:h-[286px]">
          <ProjectCover
            project={card.project}
            compact={true}
            className="h-full transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="relative z-20 flex min-w-0 flex-1 flex-col space-y-3 px-1 pb-2 pt-5">
          <motion.p
            layoutId={layout ? `category-${card.title}` : undefined}
            className="section-kicker"
          >
            {card.category}
          </motion.p>
          <motion.h3
            layoutId={layout ? `title-${card.title}` : undefined}
            className="font-display text-safe-balance max-w-sm min-h-[6.6rem] line-clamp-3 text-2xl font-semibold tracking-tight text-[#102133]"
          >
            {card.title}
          </motion.h3>
          <p className="text-safe-wrap line-clamp-4 text-sm leading-6 text-[#5c6675]">
            {card.summary}
          </p>
          <div className="mt-auto flex items-center gap-2 pt-2 text-sm font-semibold text-[#0b544b]">
            Open case study
            <IconArrowNarrowRight className="h-4 w-4" />
          </div>
        </div>
      </motion.button>
    </>
  );
};
