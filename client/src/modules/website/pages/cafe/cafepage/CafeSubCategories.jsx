import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Leaf,
  MoonStar,
  Sparkles,
  SunMedium,
  Waves,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { siteContent } from "@/data/siteContent";


const ICONS = [Coffee, Leaf, SunMedium, Sparkles, Waves, MoonStar];

function DesktopStoryCard({ card, onHoverChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = card.icon;

  const handleHover = (value) => {
    setIsHovered(value);
    onHoverChange?.(value);
  };

  return (
    <motion.article
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
    >
      {/* Blurred glass background to fill any letterbox space */}
      <img
        src={card.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75"
      />
      <motion.img
        src={card.image}
        alt={card.title}
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 h-full w-full object-contain object-left"
      />
      <div className="absolute inset-0 bg-linear-to-tr from-black/45 via-black/10 to-transparent" />
      <div className="absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
        <Icon className="h-3 w-3" /> {card.eyebrow}
      </div>

      {/* Overlay panel — always open at ~30% (320px), expands to 456px on hover */}
      <motion.div
        animate={{ width: isHovered ? "456px" : "320px" }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="absolute inset-y-0 right-0 z-20 flex h-full flex-col border-l border-white/10 bg-[#F8F8F6]/96 backdrop-blur-md dark:border-white/5 dark:bg-zinc-950/92"
      >
        <div className="flex h-full w-full flex-col justify-center gap-6 overflow-hidden p-8 xl:p-10">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
              {card.accent}
            </p>
            <h3 className="text-3xl font-serif leading-tight text-zinc-950 dark:text-white">
              {card.title}
            </h3>
            <p
              className={`text-sm leading-relaxed text-zinc-600 dark:text-white/50 ${isHovered ? "" : "line-clamp-3"
                }`}
            >
              {card.description}
            </p>
          </div>

          <motion.div
            animate={{ opacity: isHovered ? 1 : 0.82, y: isHovered ? 0 : 8 }}
            className="space-y-4"
          >
            <div className="rounded-3xl bg-primary p-5 text-white shadow-lg">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                Highlight
              </p>
              <p className="font-serif text-base italic">{card.benefit}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {card.stats.map((stat) => (
                <span
                  key={stat}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-[9px] font-bold text-zinc-400"
                >
                  {stat}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  );
}

function MobileStoryCard({ card }) {
  const Icon = card.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="w-full overflow-hidden rounded-[2rem] border border-zinc-100 bg-white shadow-xl dark:border-white/5 dark:bg-zinc-900"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={card.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-75"
        />
        <img
          src={card.image}
          className="relative h-full w-full object-contain object-left"
          alt={card.title}
        />
      </div>
      <div className="space-y-4 p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Icon className="h-3 w-3" /> {card.eyebrow}
        </div>
        <h3 className="text-3xl font-serif text-zinc-950 dark:text-white">
          {card.title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-white/50">
          {card.description}
        </p>
        <div className="rounded-2xl bg-primary p-5 text-white">
          <p className="text-sm italic font-serif">{card.benefit}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {card.stats.map((stat) => (
            <span
              key={stat}
              className="rounded-full border border-zinc-200 px-3 py-1 text-[9px] font-bold text-zinc-400 dark:border-white/10"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

import { useMemo } from "react";

export default function CafeSubCategories({ initialData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Determine cards: dynamic from props or static fallback
  const cards = useMemo(() => {
    const entries = initialData?.entries || initialData?.cards;
    if (entries && entries.length > 0) {
      return entries.filter((c) => c.active !== false).map((c, i) => ({
        ...c,
        id: c.id || i,
        eyebrow: c.subtitle || c.eyebrow || "Discovery",
        title: c.title || "The Craft",
        description: c.description || "",
        benefit: c.profileText || c.benefit || "",
        accent: c.high || c.accent || "",
        image: c.imageUrl || c.image,
        stats: [c.tag1, c.tag2].filter(Boolean).length > 0 ? [c.tag1, c.tag2].filter(Boolean) : (c.stats || []),
        icon: ICONS[i % ICONS.length],
      }));
    }
    return [];
  }, [initialData]);

  const sectionInfo = useMemo(() => {
    return {
      heading: initialData?.heading || "Six Chapters One Cafe",
      highlight: initialData?.highlight || "Our Story",
      description: initialData?.description || "Discover the story behind every cup and every corner through a simple vertical slider instead of the old scroll-driven flow.",
    };
  }, [initialData]);

  useEffect(() => {
    if (isPaused || cards.length === 0) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, cards.length]);

  if (!cards || cards.length === 0) return null;

  const activeCard = cards[activeIndex] || cards[0];

  const handlePrev = () =>
    setActiveIndex((prev) =>
      prev === 0 ? cards.length - 1 : prev - 1,
    );

  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % cards.length);

  return (
    <section
      className="relative overflow-hidden bg-[#F7F7F5] py-10 md:py-24 dark:bg-[#0f0f0f]"
    >
      {/* ── Sparkle background animation ─────────────────────────────────── */}
      <style>{`
        @keyframes floatSparkle {
          0%   { transform: translateY(0px) scale(1);   opacity: 0.18; }
          50%  { transform: translateY(-22px) scale(1.3); opacity: 0.55; }
          100% { transform: translateY(0px) scale(1);   opacity: 0.18; }
        }
        .sparkle-dot { animation: floatSparkle var(--dur, 4s) ease-in-out infinite; }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { size: 6, top: "8%", left: "6%", dur: "3.8s", delay: "0s" },
          { size: 10, top: "18%", left: "22%", dur: "5.2s", delay: "0.7s" },
          { size: 5, top: "55%", left: "10%", dur: "4.4s", delay: "1.2s" },
          { size: 8, top: "72%", left: "30%", dur: "6.0s", delay: "0.3s" },
          { size: 7, top: "12%", left: "75%", dur: "4.9s", delay: "1.8s" },
          { size: 11, top: "38%", left: "88%", dur: "5.6s", delay: "0.9s" },
          { size: 5, top: "80%", left: "68%", dur: "3.5s", delay: "2.1s" },
          { size: 9, top: "62%", left: "50%", dur: "4.2s", delay: "0.5s" },
        ].map((s, i) => (
          <div
            key={i}
            className="sparkle-dot absolute rounded-full bg-amber-400"
            style={{
              width: s.size,
              height: s.size,
              top: s.top,
              left: s.left,
              "--dur": s.dur,
              animationDelay: s.delay,
              boxShadow: `0 0 ${s.size * 2}px ${s.size}px rgba(251,191,36,0.35)`,
            }}
          />
        ))}
      </div>
      <div className="hidden w-full lg:block">
        <div className="container mx-auto grid min-h-[58vh] items-center grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 px-12 xl:px-24">
          <div className="relative flex items-center justify-center h-full">
            <div className="relative h-full w-full">
              <AnimatePresence mode="wait">
                <DesktopStoryCard
                  key={activeCard.id}
                  card={activeCard}
                  onHoverChange={setIsPaused}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Nav / controls — now on the RIGHT */}
          <div className="flex h-full flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Coffee className="h-3.5 w-3.5" /> {sectionInfo.highlight}
            </div>
            <h2 className="mb-8 text-5xl xl:text-6xl font-serif leading-[1.1] text-primary">
              {sectionInfo.heading.split(" ").slice(0, -2).join(" ")} <br />
              <span className="italic text-primary">
                {sectionInfo.heading.split(" ").slice(-2).join(" ")}
              </span>
            </h2>
            <p className="mb-10 max-w-sm text-base leading-relaxed text-zinc-600 dark:text-white/60">
              {sectionInfo.description}
            </p>

            <div className="flex flex-col gap-4">
              {cards.map((card, index) => (
                <button
                  key={card.id || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group flex items-center gap-4 text-left cursor-pointer"
                >
                  <span
                    className={`h-px w-8 transition-all ${activeIndex === index ? "bg-primary" : "bg-zinc-300"
                      }`}
                  />
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeIndex === index
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-white/70"
                      }`}
                  >
                    {card.eyebrow || card.title}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-primary hover:text-primary dark:border-white/10 dark:bg-zinc-900 dark:text-white cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-primary hover:text-primary dark:border-white/10 dark:bg-zinc-900 dark:text-white cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(cards.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-6 lg:hidden">
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Coffee className="h-3 w-3" /> {sectionInfo.highlight}
          </div>
          <h2 className="mb-6 text-4xl font-serif text-primary">
            {sectionInfo.heading.split(" ").slice(0, -2).join(" ")} <span className="italic text-primary">{sectionInfo.heading.split(" ").slice(-2).join(" ")}</span>
          </h2>
          <p className="text-sm text-zinc-500">
            {sectionInfo.description}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <MobileStoryCard key={activeCard.id} card={activeCard} />
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-primary hover:text-primary dark:border-white/10 dark:bg-zinc-900 dark:text-white cursor-pointer sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {cards.map((card, index) => (
              <button
                key={card.id || index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all cursor-pointer sm:h-2 ${activeIndex === index
                  ? "w-7 bg-primary sm:w-8"
                  : "w-1.5 bg-zinc-300 dark:bg-white/20 sm:w-2"
                  }`}
                aria-label={`Go to ${card.title}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-all hover:border-primary hover:text-primary dark:border-white/10 dark:bg-zinc-900 dark:text-white cursor-pointer sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
