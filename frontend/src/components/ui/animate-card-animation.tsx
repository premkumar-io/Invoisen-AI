"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CardItem {
  id: number;
  contentType: 1 | 2 | 3;
}

export interface CardDetails {
  title: string;
  description: string;
  image: string;
}

const defaultCardData: Record<1 | 2 | 3, CardDetails> = {
  1: {
    title: "AI Neural Invoicing Engine",
    description: "Autonomous line-item prediction & Swiss entity validation",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
  },
  2: {
    title: "Instant Vector PDF Export",
    description: "High-resolution typography, logos, and custom Swiss templates",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  3: {
    title: "Real-Time Ledger & Multi-Currency",
    description: "Live conversion for 160+ currencies with automated tax rules",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
  },
};

const initialCards: CardItem[] = [
  { id: 1, contentType: 1 },
  { id: 2, contentType: 2 },
  { id: 3, contentType: 3 },
];

const positionStyles = [
  { scale: 1, y: 12 },
  { scale: 0.95, y: -16 },
  { scale: 0.9, y: -44 },
];

const exitAnimation = {
  y: 340,
  scale: 1,
  zIndex: 10,
};

const enterAnimation = {
  y: -16,
  scale: 0.9,
};

function CardContent({
  contentType,
  customData,
}: {
  contentType: 1 | 2 | 3;
  customData?: Record<1 | 2 | 3, CardDetails>;
}) {
  const data = (customData || defaultCardData)[contentType];

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="-outline-offset-1 flex h-[190px] w-full items-center justify-center overflow-hidden rounded-xl outline outline-black/10 dark:outline-white/10 relative group">
        <img
          src={data.image || "/placeholder.svg"}
          alt={data.title}
          className="h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>
      <div className="flex w-full items-center justify-between gap-2 px-3 pb-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-headline text-base font-bold text-foreground">
            {data.title}
          </span>
          <span className="truncate text-xs font-medium text-muted-foreground">
            {data.description}
          </span>
        </div>
        <button className="flex h-9 shrink-0 cursor-pointer select-none items-center gap-1 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          Explore
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
          >
            <path d="M9.5 18L15.5 12L9.5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AnimatedCard({
  card,
  index,
  isAnimating,
  customData,
}: {
  card: CardItem;
  index: number;
  isAnimating: boolean;
  customData?: Record<1 | 2 | 3, CardDetails>;
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2];
  const zIndex = index === 0 && isAnimating ? 10 : 3 - index;

  const exitAnim = index === 0 ? exitAnimation : undefined;
  const initialAnim = index === 2 ? enterAnimation : undefined;

  return (
    <motion.div
      key={card.id}
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{
        type: "spring",
        duration: 1,
        bounce: 0,
      }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        bottom: 0,
      }}
      className="absolute flex h-[280px] w-[324px] items-center justify-center overflow-hidden rounded-t-2xl border-x border-t border-border/80 bg-card/90 backdrop-blur-xl p-1 shadow-2xl will-change-transform sm:w-[512px]"
    >
      <CardContent contentType={card.contentType} customData={customData} />
    </motion.div>
  );
}

export default function AnimatedCardStack({
  customData,
}: {
  customData?: Record<1 | 2 | 3, CardDetails>;
}) {
  const [cards, setCards] = useState(initialCards);
  const [isAnimating, setIsAnimating] = useState(false);
  const [nextId, setNextId] = useState(4);

  const handleAnimate = () => {
    setIsAnimating(true);

    const nextContentType = ((cards[2].contentType % 3) + 1) as 1 | 2 | 3;

    setCards([...cards.slice(1), { id: nextId, contentType: nextContentType }]);
    setNextId((prev) => prev + 1);
    setIsAnimating(false);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative h-[380px] w-full overflow-hidden sm:w-[644px]">
        <AnimatePresence initial={false}>
          {cards.slice(0, 3).map((card, index) => (
            <AnimatedCard
              key={card.id}
              card={card}
              index={index}
              isAnimating={isAnimating}
              customData={customData}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-border/80 py-4">
        <button
          onClick={handleAnimate}
          className="flex h-10 cursor-pointer select-none items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 font-headline text-xs font-bold text-primary shadow-md transition-all hover:bg-primary hover:text-white active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[16px]">rotate_right</span>
          Cycle Stack Showcase
        </button>
      </div>
    </div>
  );
}
