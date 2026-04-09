import {
  ChevronDown,
  Coffee,
  Leaf,
  MoonStar,
  Sparkles,
  SunMedium,
  Waves,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/data/siteContent";

const STORY_CARDS = [
  {
    id: 1,
    eyebrow: "Morning Ritual",
    title: "Single Origin Espresso",
    description:
      "Dark cacao depth and dense crema create a sharper wake-up profile for early cafe regulars.",
    benefit: "High aroma & bold body",
    accent: "Fast starts",
    image: siteContent.images.cafes.minimalist.src,
    icon: Coffee,
    stats: ["18g dose", "25s pull"],
  },
  {
    id: 2,
    eyebrow: "Slow Brewing",
    title: "Pour Over Ritual",
    description:
      "Hand brewing opens cleaner acidity and floral lift designed for longer sipping.",
    benefit: "Nuanced tasting notes",
    accent: "Calm moments",
    image: siteContent.images.cafes.library.src,
    icon: Leaf,
    stats: ["92C water", "3m bloom"],
  },
  {
    id: 3,
    eyebrow: "Noon Reset",
    title: "Flat White Balance",
    description:
      "A tighter milk texture keeps espresso structure intact, making the cup creamy without losing roast identity.",
    benefit: "Silky mouthfeel",
    accent: "Mid-day focus",
    image: siteContent.images.cafes.parisian.src,
    icon: SunMedium,
    stats: ["Double shot", "Velvet foam"],
  },
  {
    id: 4,
    eyebrow: "Cold Extraction",
    title: "Cold Brew Reserve",
    description:
      "Overnight steeping lowers bitterness and builds a smoother, chocolate-toned drink.",
    benefit: "Lower acidity",
    accent: "Long conversations",
    image: siteContent.images.cafes.garden.src,
    icon: Waves,
    stats: ["14hr steep", "Clean chill"],
  },
  {
    id: 5,
    eyebrow: "Comfort Pairing",
    title: "Bakery And Brew",
    description:
      "Buttery bakes and roasted coffee are paired to stretch aroma across the entire experience.",
    benefit: "Fuller flavor contrast",
    accent: "Relaxed brunches",
    image: siteContent.images.cafes.bakery.src,
    icon: Sparkles,
    stats: ["Warm pastry", "Soft sweet"],
  },
  {
    id: 6,
    eyebrow: "Evening Mood",
    title: "Mocha Afterglow",
    description:
      "Cocoa bitterness and espresso warmth turn the last coffee of the day into a slower indulgence.",
    benefit: "Dessert-like depth",
    accent: "Late hours",
    image: siteContent.images.cafes.highTea.src,
    icon: MoonStar,
    stats: ["Cocoa layer", "Night sip"],
  },
];

// --- DESKTOP COMPONENTS ---
function DesktopStoryCard({ card, index, progress, total }) {
  const [isHovered, setIsHovered] = useState(false);
  const unit = 1 / total;
  const start = index * unit;
  const end = (index + 1) * unit;
  const combinedRange = [start - unit * 0.6, start, end, end + unit * 0.6];

  const y = useSpring(useTransform(progress, combinedRange, [80, 0, 0, -80]), {
    stiffness: 40,
    damping: 20,
  });
  const scale = useSpring(
    useTransform(progress, combinedRange, [0.96, 1, 1, 0.96]),
    { stiffness: 40, damping: 20 },
  );
  const opacity = useTransform(progress, combinedRange, [0, 1, 1, 0]);

  const Icon = card.icon;

  return (
    <motion.article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ y, scale, opacity, zIndex: total - index }}
      className="absolute inset-0 flex h-full w-full overflow-hidden rounded-[2.5rem] border border-white/60 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="relative flex-grow h-full overflow-hidden">
        <motion.img
          src={card.image}
          alt={card.title}
          animate={{ scale: isHovered ? 1.05 : 1.1 }}
          transition={{ duration: 1 }}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
        <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
          <Icon className="h-3 w-3" /> {card.eyebrow}
        </div>
      </div>

      <motion.div
        animate={{ width: isHovered ? "450px" : "80px" }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="relative h-full flex flex-col border-l border-zinc-100 bg-[#fffaf4] dark:bg-zinc-950 dark:border-white/5"
      >
        <div className="h-full w-full overflow-hidden flex flex-col justify-between p-8 xl:p-10">
          <div className="space-y-4 min-w-[320px]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800/60">
              {card.accent}
            </p>
            <h3 className="text-3xl font-serif leading-tight text-zinc-950 dark:text-white">
              {card.title}
            </h3>
            <motion.p
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="text-sm leading-relaxed text-zinc-600 dark:text-white/50"
            >
              {card.description}
            </motion.p>
          </div>
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            className="space-y-4 min-w-[320px]"
          >
            <div className="rounded-3xl bg-[#2b1d14] p-5 text-white shadow-lg">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/40">
                Profile
              </p>
              <p className="font-serif text-base italic">{card.benefit}</p>
            </div>
            <div className="flex gap-2">
              {card.stats.map((s) => (
                <span
                  key={s}
                  className="text-[9px] font-bold border border-zinc-200 px-3 py-1 rounded-full text-zinc-400"
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.div
          animate={{ opacity: isHovered ? 0 : 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <p className="rotate-90 text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-300 whitespace-nowrap">
            {card.title.split(" ")[0]} — STORY
          </p>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

// --- MOBILE COMPONENTS ---
function MobileStoryCard({ card, index, progress, total }) {
  const unit = 1 / total;
  const start = index * unit;
  const end = (index + 1) * unit;

  const y = useSpring(useTransform(progress, [start, end], [0, -15]), {
    stiffness: 40,
    damping: 20,
  });
  const scale = useSpring(useTransform(progress, [start, end], [1, 0.92]), {
    stiffness: 40,
    damping: 20,
  });
  const opacity = useTransform(
    progress,
    [start - 0.1, start, end, end + 0.1],
    [0, 1, 1, 0],
  );

  return (
    <motion.article
      style={{ y, scale, opacity, zIndex: index }}
      className="sticky top-[15vh] w-full bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-xl border border-zinc-100 dark:border-white/5 mb-[40vh]"
    >
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={card.image}
          className="h-full w-full object-cover"
          alt={card.title}
        />
      </div>
      <div className="p-8 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
          {card.accent}
        </p>
        <h3 className="text-3xl font-serif text-zinc-950 dark:text-white">
          {card.title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-white/50 leading-relaxed">
          {card.description}
        </p>
        <div className="bg-[#2b1d14] p-5 rounded-2xl text-white">
          <p className="text-sm italic font-serif">{card.benefit}</p>
        </div>
      </div>
    </motion.article>
  );
}

const AUTO_SKIP_DELAY = 2000;
const THRESHOLD = 1 / STORY_CARDS.length;

// --- MAIN SECTION ---
export default function CafeCoffeeStory() {
  const sectionRef = useRef(null);
  const timerRef = useRef(null);
  const showRef = useRef(false);
  const continuedRef = useRef(false);
  const [showContinue, setShowContinue] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 25, damping: 15, mass: 1 });

  const triggerAutoSkip = () => {
    timerRef.current = setTimeout(() => {
      if (sectionRef.current) {
        const bottom = sectionRef.current.offsetTop + sectionRef.current.offsetHeight;
        window.scrollTo({ top: bottom, behavior: "smooth" });
      }
    }, AUTO_SKIP_DELAY);
  };

  useMotionValueEvent(smoothProgress, "change", (v) => {
    // Forward: past first card — show overlay + start timer
    if (v > THRESHOLD && !showRef.current && !continuedRef.current) {
      showRef.current = true;
      setShowContinue(true);
      triggerAutoSkip();
    }
    // Backward: scrolled back before threshold — reset so it triggers again
    if (v < THRESHOLD * 0.3 && (showRef.current || continuedRef.current)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      showRef.current = false;
      continuedRef.current = false;
      setShowContinue(false);
    }
  });

  const handleContinue = () => {
    continuedRef.current = true;
    showRef.current = false;
    setShowContinue(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#fdfaf6] dark:bg-[#080808] h-[600vh] lg:h-[700vh]"
    >
      {/* DESKTOP LAYOUT */}
      <div className="sticky top-0 hidden h-screen w-full items-center lg:flex overflow-hidden">
        <div className="grid h-full w-full grid-cols-[0.7fr_1.3fr] gap-16 px-12 xl:px-24">
          <div className="flex flex-col justify-center h-full max-h-[65vh]">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-900">
              <Coffee className="h-3.5 w-3.5" /> Discovery
            </div>
            <h2 className="mb-8 text-6xl font-serif leading-[1.1] text-zinc-950 dark:text-white">
              The Art of <br />
              <span className="italic text-amber-800">Slow Brewing</span>
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-white/60 mb-10 max-w-sm">
              Each chapter unfolds a new texture. Scroll to transition, hover to
              explore the finer details.
            </p>
            <div className="flex flex-col gap-6">
              {STORY_CARDS.map((card, i) => {
                const active = useTransform(
                  smoothProgress,
                  [i / 6, (i + 0.5) / 6, (i + 1) / 6],
                  [0.2, 1, 0.2],
                );
                return (
                  <motion.div
                    key={card.id}
                    style={{ opacity: active }}
                    className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white"
                  >
                    <span className="h-px w-8 bg-amber-800" /> {card.title}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center h-full">
            <div className="relative h-[65vh] w-full">
              {STORY_CARDS.map((card, index) => (
                <DesktopStoryCard
                  key={card.id}
                  card={card}
                  index={index}
                  progress={smoothProgress}
                  total={6}
                />
              ))}

              {/* Transparent overlay on card area */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div
                    key="continue-overlay"
                    onClick={handleContinue}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-[60] flex flex-col items-center justify-center cursor-pointer rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-black/15 rounded-[2.5rem]" />
                    <div className="relative z-10 flex flex-col items-center gap-3 select-none">
                      <p className="font-serif text-3xl xl:text-4xl italic text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
                        Continue Story
                      </p>
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                      >
                        <ChevronDown className="h-7 w-7 text-white/80 drop-shadow-lg" />
                      </motion.div>
                      <div className="w-20 h-px bg-white/30 rounded-full overflow-hidden mt-1">
                        <motion.div
                          key={showContinue ? "bar-on" : "bar-off"}
                          initial={{ scaleX: 1 }}
                          animate={{ scaleX: 0 }}
                          transition={{ duration: AUTO_SKIP_DELAY / 1000, ease: "linear" }}
                          className="h-full bg-white/70 origin-left"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden w-full px-6 py-24">
        <div className="mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-900/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-900">
            <Coffee className="h-3 w-3" /> The Journey
          </div>
          <h2 className="text-5xl font-serif text-zinc-950 dark:text-white mb-6">
            Every <span className="italic text-amber-800">Roast</span>
          </h2>
          <p className="text-zinc-500 text-sm">Scroll down to explore our coffee rituals.</p>
        </div>
        <div className="relative">
          {STORY_CARDS.map((card, index) => (
            <MobileStoryCard
              key={`mobile-${card.id}`}
              card={card}
              index={index}
              progress={smoothProgress}
              total={STORY_CARDS.length}
            />
          ))}
        </div>
      </div>

      {/* Mobile — fixed center overlay */}
      <AnimatePresence>
        {showContinue && (
          <motion.div
            key="mobile-overlay"
            onClick={handleContinue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer bg-black/25"
          >
            <div className="flex flex-col items-center gap-3 select-none">
              <p className="font-serif text-3xl italic text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.6)]">
                Continue Story
              </p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              >
                <ChevronDown className="h-7 w-7 text-white/80" />
              </motion.div>
              <div className="w-20 h-px bg-white/30 rounded-full overflow-hidden mt-1">
                <motion.div
                  key={showContinue ? "mob-bar-on" : "mob-bar-off"}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: AUTO_SKIP_DELAY / 1000, ease: "linear" }}
                  className="h-full bg-white/70 origin-left"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
